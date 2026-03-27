from app.services.groq_claims import extract_claims
from app.services.tavily_research import research_claims
from app.services.groq_validator import validate_claims
from app.services.scoring import calculate_score


def run_pipeline(transcript: str) -> dict:
    """
    Full pipeline:
    Transcript → Gemini 1 (Claims) → Tavily (Research) → Gemini 2 (Validation) → Score
    """

    # Validate input
    if not transcript or not transcript.strip():
        return {"error": "Transcript is empty or invalid"}

    # Step 1 — Extract claims from transcript
    print("Step 1: Extracting claims...")
    extracted = extract_claims(transcript)

    # Handle extraction errors
    if "error" in extracted:
        return {
            "error": "Claim extraction failed",
            "details": extracted
        }

    claims = extracted.get("claims", [])

    # Handle case where claims is still a dict after extraction
    if isinstance(claims, dict):
        for key in claims:
            if isinstance(claims[key], list):
                claims = claims[key]
                break

    # Handle empty claims
    if not claims:
        return {
            "error": "No verifiable claims found in transcript"
        }

    # Ensure all claims are strings
    claims = [str(claim) for claim in claims if claim]

    # Step 2 — Research each claim using Tavily
    print(f"Step 2: Researching {len(claims)} claims...")
    research_results = research_claims(claims)

    # Handle research errors
    if not research_results:
        return {
            "error": "Research failed, no results returned from Tavily"
        }

    # Step 3 — Validate each claim using Gemini 2
    print("Step 3: Validating claims...")
    verdicts = validate_claims(research_results)

    # Handle validation errors
    if not verdicts:
        return {
            "error": "Validation failed, no verdicts returned from Gemini"
        }

    # Step 4 — Calculate score
    print("Step 4: Calculating score...")
    score = calculate_score(verdicts)

    # Final structured output
    return {
        "transcript": transcript,
        "total_claims": len(claims),
        "claims": claims,
        "verdicts": verdicts,
        "score": score
    }