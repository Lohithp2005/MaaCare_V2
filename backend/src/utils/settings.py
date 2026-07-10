from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    DB_CONNECTION: str
    GEMINI_API_KEY: str
    ENCRYPTION_KEY: str
    SECRET_KEY:str
    ALGORITHM:str
    EXPIRES_IN:int
    
settings = Settings()
print(f"connected to: {settings.DB_CONNECTION}")