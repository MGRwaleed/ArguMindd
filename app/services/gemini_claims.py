from google import genai
from app.core.config import settings
import json
import re

client = genai.Client(api_key=settings.GEMINI_API_KEY)


def extract_claims(transcript: str):
    prompt = f"""
Extract only verifiable factual claims from the debate transcript below.
- Ignore opinions, emotions, and vague statements
- Each claim must be a standalone, checkable fact
- Extract ALL factual claims, even if they contradict each other
- Always translate non-English claims to English before extracting
- Return ONLY a flat JSON array of strings like this: ["claim1", "claim2"]
- Do NOT return a dictionary or object
- Do not use markdown or backticks

Text:
{transcript}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        claims_text = response.text.strip()

        # Remove markdown code fences if present
        claims_text = re.sub(
            r"^```json\s*|\s*```$",
            "",
            claims_text.strip(),
            flags=re.MULTILINE
        )

        try:
            claims = json.loads(claims_text)

            # Handle case where Gemini returns a dict instead of a list
            if isinstance(claims, dict):
                for key in claims:
                    if isinstance(claims[key], list):
                        claims = claims[key]
                        break

            if not claims:
                return {"claims": [], "note": "No verifiable claims found"}

            return {"claims": claims}

        except json.JSONDecodeError:
            return {
                "claims": [claims_text],
                "note": "Response was not valid JSON; returned as raw text"
            }

    except Exception as e:
        return {
            "error": "Gemini call failed",
            "details": str(e)
        }