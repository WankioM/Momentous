use serde::{Deserialize, Serialize};
use sqlx::types::chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Service {
    pub id: Uuid,
    pub provider_id: Uuid,
    pub title: String,
    pub description: String,
    pub time_cost: i32, // Time in minutes
    pub categories: Vec<String>,
    pub avg_rating: Option<f32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateServiceDto {
    pub title: String,
    pub description: String,
    pub time_cost: i32,
    pub categories: Vec<String>,
}