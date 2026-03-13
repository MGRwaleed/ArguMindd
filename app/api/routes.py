from fastapi import APIRouter
from app.services.gemini_claims import extract_claims
from app.services.tavily_research import research_claims
from app.services.gemini_validator import validate_claims
from app.services.pipeline import run_pipeline

router = APIRouter()

@router.post("/extract-claims")
def extract_claims_api(payload: dict):
    transcript = payload.get("transcript")
    return extract_claims(transcript)

@router.post("/research-claims")
def research_claims_api(payload: dict):
    claims = payload.get("claims")
    return {"results": research_claims(claims)}

@router.post("/validate-claims")
def validate_claims_api(payload: dict):
    research_results = payload.get("research_results")
    return {"verdicts": validate_claims(research_results)}

@router.post("/analyze-debate")
def analyze_debate(payload: dict):
    transcript = payload.get("transcript")
    if not transcript:
        return {"error": "No transcript provided"}
    return run_pipeline(transcript)