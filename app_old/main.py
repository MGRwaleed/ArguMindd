from fastapi import FastAPI
from pydantic import BaseModel
from app.services.transcript_processor import analyze_transcript


app = FastAPI()


class TranscriptInput(BaseModel):
    transcript: str


@app.get("/")
def root():
    return {"message": "ArguMind backend is running"}


@app.post("/process-transcript")
def process_transcript(data: TranscriptInput):
    result = analyze_transcript(data.transcript)

    return {
        "status": "processed",
        "analysis": result
    }
