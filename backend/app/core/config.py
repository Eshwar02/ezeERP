from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ezeERP"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./ezeerp.db"
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 60 * 8

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()

