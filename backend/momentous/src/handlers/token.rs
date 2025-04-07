use crate::models::time_token::{CreateTokenDto, TimeToken, TransferTokenDto};
use actix_web::{web, HttpRequest, HttpResponse, Responder};
use sqlx::PgPool;
use uuid::Uuid;
use serde_json::json;

use crate::auth::Claims;
use jsonwebtoken::{decode, DecodingKey, Validation};
use std::env;

// Helper function to extract user ID from token
fn get_user_id_from_request(req: &HttpRequest) -> Result<Uuid, HttpResponse> {
    let auth_header = req
        .headers()
        .get("Authorization")
        .ok_or_else(|| {
            HttpResponse::Unauthorized().json(json!({
                "error": "No authorization header"
            }))
        })?
        .to_str()
        .map_err(|_| {
            HttpResponse::Unauthorized().json(json!({
                "error": "Invalid authorization header format"
            }))
        })?;

    if !auth_header.starts_with("Bearer ") {
        return Err(HttpResponse::Unauthorized().json(json!({
            "error": "Invalid authorization scheme"
        })));
    }

    let token = &auth_header[7..]; // Remove "Bearer " prefix
    let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| {
        HttpResponse::Unauthorized().json(json!({
            "error": "Invalid token"
        }))
    })?;
    
    let user_id = Uuid::parse_str(&token_data.claims.sub).map_err(|_| {
        HttpResponse::InternalServerError().json(json!({
            "error": "Invalid user ID in token"
        }))
    })?;
    
    Ok(user_id)
}

pub async fn create_token(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    token_data: web::Json<CreateTokenDto>,
) -> impl Responder {
    let user_id = match get_user_id_from_request(&req) {
        Ok(id) => id,
        Err(response) => return response,
    };
    
    let token_id = Uuid::new_v4();
    
    let result = sqlx::query_as!(
        TimeToken,
        "INSERT INTO time_tokens (id, issuer_id, current_owner_id, denomination, expires_at, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, issuer_id, current_owner_id, denomination, created_at, expires_at, is_active",
        token_id,
        user_id,
        user_id, // Initially, the issuer is also the owner
        token_data.denomination,
        token_data.expires_at,
        true
    )
    .fetch_one(pool.get_ref())
    .await;
    
    match result {
        Ok(token) => HttpResponse::Created().json(token),
        Err(e) => {
            eprintln!("Database error: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to create token"
            }))
        }
    }
}

pub async fn transfer_tokens(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    transfer_data: web::Json<TransferTokenDto>,
) -> impl Responder {
    let user_id = match get_user_id_from_request(&req) {
        Ok(id) => id,
        Err(response) => return response,
    };
    
    // Start a transaction
    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(e) => {
            eprintln!("Failed to start transaction: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "Database error"
            }));
        }
    };
    
    // Verify token ownership
    for token_id in &transfer_data.token_ids {
        let token = sqlx::query!(
            "SELECT current_owner_id, is_active FROM time_tokens WHERE id = $1",
            token_id
        )
        .fetch_optional(&mut *tx)
        .await;
        
        match token {
            Ok(Some(token_record)) => {
                if token_record.current_owner_id != user_id {
                    return HttpResponse::Forbidden().json(json!({
                        "error": "You don't own this token",
                        "token_id": token_id
                    }));
                }
                
                if !token_record.is_active {
                    return HttpResponse::BadRequest().json(json!({
                        "error": "Token is not active",
                        "token_id": token_id
                    }));
                }
            }
            Ok(None) => {
                return HttpResponse::NotFound().json(json!({
                    "error": "Token not found",
                    "token_id": token_id
                }));
            }
            Err(e) => {
                eprintln!("Database error: {}", e);
                return HttpResponse::InternalServerError().json(json!({
                    "error": "Database error"
                }));
            }
        }
    }
    
    // Update token ownership
    for token_id in &transfer_data.token_ids {
        let result = sqlx::query!(
            "UPDATE time_tokens SET current_owner_id = $1, updated_at = NOW() WHERE id = $2",
            transfer_data.recipient_id,
            token_id
        )
        .execute(&mut *tx)
        .await;
        
        if let Err(e) = result {
            eprintln!("Failed to update token: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "Failed to transfer token"
            }));
        }
    }
    
    // Record the transaction
    let transaction_id = Uuid::new_v4();
    let result = sqlx::query!(
        "INSERT INTO transactions (id, sender_id, recipient_id, service_id, status) 
         VALUES ($1, $2, $3, $4, $5)",
        transaction_id,
        user_id,
        transfer_data.recipient_id,
        transfer_data.service_id,
        "completed" // Since this is a simple transfer
    )
    .execute(&mut *tx)
    .await;
    
    if let Err(e) = result {
        eprintln!("Failed to record transaction: {}", e);
        return HttpResponse::InternalServerError().json(json!({
            "error": "Failed to record transaction"
        }));
    }
    
    // Insert token transfers
    for token_id in &transfer_data.token_ids {
        let result = sqlx::query!(
            "INSERT INTO token_transfers (transaction_id, token_id) VALUES ($1, $2)",
            transaction_id,
            token_id
        )
        .execute(&mut *tx)
        .await;
        
        if let Err(e) = result {
            eprintln!("Failed to record token transfer: {}", e);
            return HttpResponse::InternalServerError().json(json!({
                "error": "Failed to record token transfer"
            }));
        }
    }
    
    // Commit the transaction
    match tx.commit().await {
        Ok(_) => HttpResponse::Ok().json(json!({
            "message": "Tokens transferred successfully",
            "transaction_id": transaction_id
        })),
        Err(e) => {
            eprintln!("Failed to commit transaction: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to complete transfer"
            }))
        }
    }
}