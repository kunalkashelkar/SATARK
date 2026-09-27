import os
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings
from app.core.logging import logger

Base = declarative_base()

def get_engine_and_url():
    target_url = settings.DATABASE_URL
    try:
        # Test connection to target URL (e.g. PostgreSQL)
        test_engine = create_engine(
            target_url,
            pool_pre_ping=settings.DB_POOL_PRE_PING,
            echo=settings.DB_ECHO,
            connect_args={"connect_timeout": 3} if "postgresql" in target_url else {}
        )
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info(f"Connected successfully to primary database: {target_url.split('@')[-1] if '@' in target_url else target_url}")
        return test_engine, target_url
    except Exception as exc:
        if settings.DB_SQLITE_FALLBACK_ON_ERROR:
            sqlite_url = settings.SQLITE_DB_URL
            logger.warning(
                f"Could not connect to primary database ({exc}). "
                f"Falling back to local SQLite database: {sqlite_url}"
            )
            sqlite_engine = create_engine(
                sqlite_url,
                connect_args={"check_same_thread": False},
                echo=settings.DB_ECHO
            )
            return sqlite_engine, sqlite_url
        else:
            logger.error(f"Database connection failed and fallback is disabled: {exc}")
            raise exc


engine, active_db_url = get_engine_and_url()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_health() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.error(f"Database health check failed: {exc}")
        return False
