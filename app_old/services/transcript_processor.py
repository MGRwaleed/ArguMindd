def analyze_transcript(transcript: str):
    """
    Analyze debate transcript and extract basic argument structure.
    This is STEP 16 logic.
    """

    # 1. Clean the input text
    text = transcript.strip()

    # 2. Split text into sentences
    sentences = [s.strip() for s in text.split(".") if s.strip()]

    # 3. Detect claims (simple rule-based logic)
    claims = []
    for sentence in sentences:
        lower_sentence = sentence.lower()
        if "should" in lower_sentence or "must" in lower_sentence:
            claims.append(sentence)

    # 4. Extract basic keywords
    words = text.split()
    keywords = list(set(words[:10]))

    # 5. Return structured result
    return {
        "total_sentences": len(sentences),
        "claims_detected": claims,
        "claims_count": len(claims),
        "keywords": keywords
    }
