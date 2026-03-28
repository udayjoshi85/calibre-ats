"""Weighted scoring algorithm for candidate analysis."""

# Signal weights (must sum to 100)
SIGNAL_WEIGHTS = {
    "experience_relevance_score": 20,
    "technical_skills_score": 15,
    "business_impact_score": 20,
    "proof_of_work_score": 15,
    "career_growth_score": 10,
    "certifications_score": 5,
    "soft_skills_score": 5,
    "resume_quality_score": 5,
    "extracurriculars_score": 5,
}


def calculate_weighted_score(signal_scores: dict) -> int:
    """Calculate weighted overall score from individual signal scores."""
    total = 0

    for signal, weight in SIGNAL_WEIGHTS.items():
        score = signal_scores.get(signal, 50)  # Default to 50 if missing
        # Ensure score is in valid range
        score = max(0, min(100, score))
        total += score * (weight / 100)

    return int(total)


def get_score_breakdown(signal_scores: dict) -> dict:
    """Get detailed breakdown of how overall score was calculated."""
    breakdown = {}

    for signal, weight in SIGNAL_WEIGHTS.items():
        score = signal_scores.get(signal, 50)
        weighted_contribution = score * (weight / 100)
        breakdown[signal] = {
            "raw_score": score,
            "weight": weight,
            "weighted_contribution": round(weighted_contribution, 2),
        }

    return breakdown


def get_score_label(score: int) -> str:
    """Get human-readable label for a score."""
    if score >= 90:
        return "Exceptional"
    elif score >= 80:
        return "Strong"
    elif score >= 70:
        return "Good"
    elif score >= 60:
        return "Fair"
    elif score >= 50:
        return "Average"
    elif score >= 40:
        return "Below Average"
    else:
        return "Weak"


def get_recommendation_explanation(recommendation: str) -> str:
    """Get explanation for a recommendation."""
    explanations = {
        "strong_yes": "Highly recommended. Strong match across most signals.",
        "yes": "Recommended. Good overall fit with some areas to explore.",
        "maybe": "Potential fit. Mixed signals - worth a closer look.",
        "no": "Not recommended. Significant gaps or red flags identified.",
    }
    return explanations.get(recommendation, "")
