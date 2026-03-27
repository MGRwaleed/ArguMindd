from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    TAVILY_API_KEY: str
    GROQ_API_KEY: str        # ← Add this

    class Config:
        env_file = ".env"

settings = Settings()
print("Loaded GEMINI key:", bool(settings.GEMINI_API_KEY))
print("Loaded TAVILY key:", bool(settings.TAVILY_API_KEY))
print("Loaded GROQ key:", bool(settings.GROQ_API_KEY))