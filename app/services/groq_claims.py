from groq import Groq
from app.core.config import settings
import json
import re

client = Groq(api_key=settings.GROQ_API_KEY)


def extract_claims(transcript: str):
    prompt = f"""
Extract only verifiable factual claims from the debate transcript below.
- Ignore opinions, emotions, and vague statements
- Each claim must be a standalone, checkable fact
- Always translate non-English claims to English before extracting
- Return ONLY a flat JSON array of strings like this: ["claim1", "claim2"]
- Do NOT return a dictionary or object
- Do not use markdown or backticks

Text:
{transcript}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )

        claims_text = response.choices[0].message.content.strip()

        # Remove markdown code fences if present
        claims_text = re.sub(
            r"^```json\s*|\s*```$",
            "",
            claims_text.strip(),
            flags=re.MULTILINE
        )

        try:
            claims = json.loads(claims_text)

            # Handle case where Groq returns a dict instead of a list
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
            "error": "Groq call failed",
            "details": str(e)
        }