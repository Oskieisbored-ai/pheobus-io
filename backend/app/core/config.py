from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    APP_NAME: str = "Pheobus.io"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    # Database — supports SQLite (dev) and PostgreSQL (production)
    DATABASE_URL: str = "sqlite:///./pheobus.db"

    # Auth
    SECRET_KEY: str = "pheobus-dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # External API keys (free tiers)
    HUNTER_API_KEY: Optional[str] = None
    CLEARBIT_API_KEY: Optional[str] = None
    ABSTRACT_API_KEY: Optional[str] = None

    # Scraping
    SCRAPE_RATE_LIMIT: float = 1.0  # seconds between requests
    MAX_CONCURRENT_SCRAPERS: int = 5
    USER_AGENT: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/128.0.0.0 Safari/537.36"
    )

    # Redis (for Celery task queue)
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Production flag
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def effective_database_url(self) -> str:
        """Handle Render's postgres:// → postgresql:// quirk."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url


settings = Settings()
