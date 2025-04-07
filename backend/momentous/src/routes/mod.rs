use actix_web::web;
use crate::handlers;

pub fn api_routes(cfg: &mut web::ServiceConfig) {
    // Auth routes
    cfg.service(
        web::scope("/api/auth")
            .route("/register", web::post().to(handlers::auth::register))
            .route("/login", web::post().to(handlers::auth::login))
    );
    
    // Token routes
    cfg.service(
        web::scope("/api/tokens")
            .route("", web::post().to(handlers::token::create_token))
            .route("/transfer", web::post().to(handlers::token::transfer_tokens))
    );
    

}