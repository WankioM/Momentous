use serde::{Deserialize, Serialize};
use sqlx::types::chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct TimeToken {
    pub id: Uuid,
    pub issuer_id: Uuid,
    pub current_owner_id: Uuid,
    pub denomination: i32, // Time in minutes
    pub created_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
    pub is_active: bool,
}

#[derive(Debug, Deserialize)]
pub struct CreateTokenDto {
    pub denomination: i32,
    pub expires_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct TransferTokenDto {
    pub recipient_id: Uuid,
    pub token_ids: Vec<Uuid>,
    pub service_id: Option<Uuid>,
}