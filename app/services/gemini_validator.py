from google import genai
from app.core.config import settings
import json
import re

client = genai.Client(api_key=settings.GEMINI_API_KEY)


def validate_claims(research_results: list[dict]) -> list[dict]:
    verdicts = []

    for item in research_results:
        claim = item.get("claim", "")
        tavily_answer = item.get("tavily_answer", "")
        sources = item.get("sources", [])

        sources_text = ""
        for i, source in enumerate(sources, 1):
            sources_text += f"""
Source {i}: {source.get('title', '')}
URL: {source.get('url', '')}
Content: {source.get('content', '')[:500]}
"""

        prompt = f"""
You are a fact-checking AI judge.
Based on the evidence provided, evaluate the following claim.

Claim: {claim}

Tavily Answer: {tavily_answer}

Supporting Sources:
{sources_text}

Verdict Guidelines:
- TRUE: The claim is fully accurate and supported by evidence
- FALSE: The claim is completely wrong or a myth with no truth to it
- PARTIALLY TRUE: Use this when the claim has SOME truth but is misleading,
  exaggerated, oversimplified, or only correct in certain contexts.
  Examples of PARTIALLY TRUE:
  * A statement that is historically true but no longer accurate today
  * A claim that is true in some cases but not universally
  * A claim that contains one correct fact but draws a wrong conclusion
  * A common myth that has a small grain of truth behind it

Confidence Guidelines:
- 1.0: Absolute certainty, multiple strong sources agree completely
- 0.8-0.9: Very confident, evidence is clear but minor gaps exist
- 0.5-0.7: Moderately confident, some ambiguity or conflicting evidence
- 0.2-0.4: Low confidence, evidence is weak or unclear

Return ONLY a valid JSON object with these exact fields:
{{
    "claim": "<the original claim>",
    "verdict": "<TRUE / FALSE / PARTIALLY TRUE>",
    "confidence": <a float between 0.0 and 1.0 where 1.0 is fully confident>,
    "explanation": "<2-3 sentence explanation>",
    "sources_used": ["<url1>", "<url2>"]
}}

Do not use markdown. Do not wrap in backticks.
"""

        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            result_text = response.text.strip()

            result_text = re.sub(
                r"^```json\s*|\s*```$",
                "",
                result_text.strip(),
                flags=re.MULTILINE
            )

            verdict = json.loads(result_text)
            verdicts.append(verdict)

        except json.JSONDecodeError:
            verdicts.append({
                "claim": claim,
                "verdict": "UNKNOWN",
                "confidence": 0.0,
                "explanation": "Could not parse Gemini response.",
                "sources_used": []
            })

        except Exception as e:
            verdicts.append({
                "claim": claim,
                "verdict": "ERROR",
                "confidence": 0.0,
                "explanation": str(e),
                "sources_used": []
            })

    return verdicts