use crate::auth::{generate_token, hash_password, verify_password};
use crate::models::user::{CreateUserDto, LoginDto, User};
use actix_web::{web, HttpResponse, Responder};
use sqlx::PgPool;
use uuid::Uuid;
use serde_json::json;

pub async fn register(
    pool: web::Data<PgPool>,
    user_data: web::Json<CreateUserDto>,
) -> impl Responder {
    // Check if user already exists
    let existing_user = sqlx::query!(
        "SELECT id FROM users WHERE email = $1",
        user_data.email
    )
    .fetch_optional(pool.get_ref())
    .await;

    match existing_user {
        Ok(Some(_)) => HttpResponse::Conflict().json(json!({
            "error": "User with this email already exists"
        })),
        Ok(None) => {
            // Hash password
            let password_hash = hash_password(&user_data.password);
            
            // Create new user
            let result = sqlx::query!(
                "INSERT INTO users (id, username, email, password_hash, reputation_score) 
                 VALUES ($1, $2, $3, $4, $5) 
                 RETURNING id, username, email, reputation_score, created_at, updated_at",
                Uuid::new_v4(),
                user_data.username,
                user_data.email,
                password_hash,
                0 // Initial reputation score
            )
            .fetch_one(pool.get_ref())
            .await;

            match result {
                Ok(user) => {
                    let token = generate_token(user.id).unwrap();
                    HttpResponse::Created().json(json!({
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "reputation_score": user.reputation_score,
                        "token": token
                    }))
                }
                Err(e) => {
                    eprintln!("Database error: {}", e);
                    HttpResponse::InternalServerError().json(json!({
                        "error": "Failed to create user"
                    }))
                }
            }
        }
        Err(e) => {
            eprintln!("Database error: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "Database error"
            }))
        }
    }
}

pub async fn login(
    pool: web::Data<PgPool>,
    login_data: web::Json<LoginDto>,
) -> impl Responder {
    let user_result = sqlx::query_as!(
        User,
        "SELECT * FROM users WHERE email = $1",
        login_data.email
    )
    .fetch_optional(pool.get_ref())
    .await;

    match user_result {
        Ok(Some(user)) => {
            if verify_password(&user.password_hash, &login_data.password) {
                let token = generate_token(user.id).unwrap();
                HttpResponse::Ok().json(json!({
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "reputation_score": user.reputation_score,
                    "token": token
                }))
            } else {
                HttpResponse::Unauthorized().json(json!({
                    "error": "Invalid credentials"
                }))
            }
        }
        Ok(None) => {
            HttpResponse::Unauthorized().json(json!({
                "error": "Invalid credentials"
            }))
        }
        Err(e) => {
            eprintln!("Database error: {}", e);
            HttpResponse::InternalServerError().json(json!({
                "error": "Database error"
            }))
        }
    }
}