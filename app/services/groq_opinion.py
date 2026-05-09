from groq import Groq
from app.core.config import settings
import json
import re

client = Groq(api_key=settings.GROQ_API_KEY)


def evaluate_opinion(transcript: str, topic: str = "", stance: str = "", response_lang: str = "English") -> dict:
    """
    Evaluates an argument that has no verifiable factual claims.
    Scores it on reasoning quality, relevance, and stance consistency.
    """

    context_line = ""
    if topic and stance:
        context_line = f"The speaker is arguing {stance.upper()} the position: \"{topic}\".\n"
    elif topic:
        context_line = f"The debate topic is \"{topic}\".\n"

    lang_instruction = f"Respond in {response_lang}. Your explanation must be written in {response_lang}.\n" if response_lang != "English" else ""

    prompt = f"""You are a debate judge evaluating an argument that contains no verifiable factual claims — it is opinion-based.

{context_line}{lang_instruction}
Argument:
\"\"\"{transcript}\"\"\"

Evaluate this argument on the following criteria:
1. Clarity — Is the argument clearly expressed?
2. Relevance — Is it relevant to the debate topic?
3. Logical strength — Does the reasoning make sense even if it's an opinion?
4. Stance consistency — Does it actually support the speaker's stated position?

Give an overall score from 0 to 100 based on argument quality.
Give a short verdict: "STRONG ARGUMENT", "MODERATE ARGUMENT", or "WEAK ARGUMENT".
Write a brief explanation of the evaluation.

Return ONLY JSON:

{{
  "verdict": "STRONG ARGUMENT / MODERATE ARGUMENT / WEAK ARGUMENT",
  "score": 0.0,
  "confidence": 0.0,
  "explanation": "...",
  "criteria": {{
    "clarity": 0.0,
    "relevance": 0.0,
    "logical_strength": 0.0,
    "stance_consistency": 0.0
  }}
}}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        result_text = response.choices[0].message.content.strip()
        result_text = re.sub(r"^```json\s*|\s*```$", "", result_text.strip(), flags=re.MULTILINE)
        result = json.loads(result_text)
        return result

    except Exception as e:
        return {
            "verdict": "WEAK ARGUMENT",
            "score": 30.0,
            "confidence": 0.3,
            "explanation": f"Opinion evaluation failed: {str(e)}",
            "criteria": {
                "clarity": 0.0,
                "relevance": 0.0,
                "logical_strength": 0.0,
                "stance_consistency": 0.0
            }
        }