from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "SAT-SA"
    APP_ENV: str = "development"
    APP_VERSION: str = "OPS-v4.8"
    API_PREFIX: str = "/api/v1"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8001

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]

    # Database
    DATABASE_URL: str = "postgresql+psycopg://sat_sa:sat_sa@localhost:5432/sat_sa"
    DB_SQLITE_FALLBACK_ON_ERROR: bool = True
    SQLITE_DB_URL: str = "sqlite:///./sat_sa.db"
    DB_POOL_PRE_PING: bool = True
    DB_ECHO: bool = False

    # Security & Enclave
    SECRET_KEY: str = "sat-sa-enclave-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    ENCLAVE_ID: str = "NCIIPC/ENCLAVE-70B"

    # Logging
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
