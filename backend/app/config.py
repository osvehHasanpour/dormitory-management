from functools import lru_cache
from os import getenv

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = getenv(
        "DATABASE_URL",
        "postgresql://dormitory:dormitory@localhost:5432/dormitory_db",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
