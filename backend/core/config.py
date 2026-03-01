from pydantic_settings import BaseSettings
from typing import List
import sys
import logging

logger = logging.getLogger(__name__)

_KNOWN_WEAK_KEYS = {
    "dev_secret_key_change_in_production_must_be_32_chars_min",
    "dev_secret_key_change_in_production_min_32_chars",
    "secret",
    "changeme",
}


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/agromarket"
    SECRET_KEY: str = "dev_secret_key_change_in_production_must_be_32_chars_min"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    # Comma-separated string (pydantic-settings v2 needs JSON for List fields via env)
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:19006"
    REDIS_URL: str = "redis://localhost:6379"
    # Set to "true" in production (HTTPS required for secure cookies)
    PRODUCTION: bool = False

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    @property
    def cookie_secure(self) -> bool:
        """Refresh token cookie must be Secure in production (HTTPS only)."""
        return self.PRODUCTION

    def validate_production_settings(self) -> None:
        """Fail fast if insecure defaults are used in production."""
        if not self.PRODUCTION:
            return
        if self.SECRET_KEY in _KNOWN_WEAK_KEYS or len(self.SECRET_KEY) < 32:
            logger.critical(
                "FATAL: SECRET_KEY is a known weak/default value. "
                "Set a strong random SECRET_KEY before running in production."
            )
            sys.exit(1)


settings = Settings()
settings.validate_production_settings()
