"""Runtime configuration loaded from environment variables (.env supported)."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Supabase (service role — bypasses RLS, only ever used server-side here)
    supabase_url: str = ""
    supabase_secret_key: str = ""

    # Ollama
    ollama_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "llama3.2:3b"
    ollama_timeout_seconds: int = 180

    # Shared secret the web app must present in `Authorization: Bearer <token>`.
    internal_token: str = ""

    max_upload_bytes: int = 25 * 1024 * 1024

    # base64-encoded 32-byte key for the encrypted per-asset map. Must match
    # ASSET_ENCRYPTION_KEY in the web app. Empty = the asset map is not stored.
    asset_encryption_key: str = ""

    @property
    def configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_secret_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
