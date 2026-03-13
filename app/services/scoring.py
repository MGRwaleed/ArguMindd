def calculate_score(verdicts: list[dict]) -> dict:
    """
    Takes verdicts from Gemini 2.
    Returns a structured score summary.
    """

    total = len(verdicts)

    if total == 0:
        return {"error": "No verdicts to score"}

    # Count verdict types
    true_count = 0
    false_count = 0
    partial_count = 0
    total_confidence = 0.0

    for verdict in verdicts:
        v = verdict.get("verdict", "").upper()
        confidence = float(verdict.get("confidence", 0.0))
        total_confidence += confidence

        if v == "TRUE":
            true_count += 1
        elif v == "FALSE":
            false_count += 1
        elif v == "PARTIALLY TRUE":
            partial_count += 1

    # TRUE = full point, PARTIALLY TRUE = half point, FALSE = no point
    raw_score = (true_count * 1.0) + (partial_count * 0.5) + (false_count * 0.0)
    accuracy_score = round((raw_score / total) * 100, 2)

    # Average confidence
    avg_confidence = round(total_confidence / total, 2)

    # Final weighted score
    final_score = round((accuracy_score * 0.7) + (avg_confidence * 100 * 0.3), 2)

    # Performance label
    if final_score >= 80:
        performance = "Strong"
    elif final_score >= 50:
        performance = "Moderate"
    else:
        performance = "Weak"

    return {
        "total_claims": total,
        "true_count": true_count,
        "false_count": false_count,
        "partially_true_count": partial_count,
        "accuracy_score": accuracy_score,
        "average_confidence": avg_confidence,
        "final_score": final_score,
        "performance": performance
    }