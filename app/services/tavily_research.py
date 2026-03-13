from tavily import TavilyClient # type: ignore
from app.core.config import settings

client = TavilyClient(api_key=settings.TAVILY_API_KEY)


def research_claims(claims: list[str]) -> list[dict]:
    """
    Takes a list of claims from Gemini 1.
    Returns evidence + sources for each claim via Tavily.
    """
    results = []

    for claim in claims:
        try:
            response = client.search(
                query=claim,
                search_depth="advanced",
                max_results=3,
                include_answer=True,
                include_raw_content=False
            )

            results.append({
                "claim": claim,
                "tavily_answer": response.get("answer", ""),
                "sources": [
                    {
                        "title": r.get("title", ""),
                        "url": r.get("url", ""),
                        "content": r.get("content", "")
                    }
                    for r in response.get("results", [])
                ]
            })

        except Exception as e:
            results.append({
                "claim": claim,
                "error": "Tavily search failed",
                "details": str(e)
            })

    return results