import json
import re
from typing import Optional

from app.config import get_settings
from app.services.database import get_supabase_client
from app.services.enrichment import enrich_github_profile, calculate_github_score
from app.services.resume_parser import calculate_resume_quality_metrics
from app.services.scoring import calculate_weighted_score
from app.prompts.extraction import get_extraction_prompt, get_analysis_prompt


def call_llm(prompt: str, settings) -> str:
    """Call LLM based on configured provider (Groq or Ollama)."""
    if settings.groq_api_key:
        # Use Groq (cloud)
        from groq import Groq
        client = Groq(api_key=settings.groq_api_key)
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        return response.choices[0].message.content
    else:
        # Use Ollama (local)
        import ollama
        response = ollama.chat(
            model=settings.ollama_model,
            messages=[{"role": "user", "content": prompt}],
            format="json",
        )
        return response["message"]["content"]


async def analyze_candidate(
    candidate_id: str,
    resume_text: str,
    job_requirements: str,
    github_url: Optional[str] = None,
):
    """Run full AI analysis pipeline for a candidate."""
    settings = get_settings()
    supabase = get_supabase_client()

    try:
        # Step 1: Enrich GitHub if available
        github_data = None
        github_score = 0
        if github_url:
            github_data = await enrich_github_profile(github_url)
            github_score = calculate_github_score(github_data)

            # Store GitHub data
            supabase.table("candidates").update({
                "github_data": github_data
            }).eq("id", candidate_id).execute()

        # Step 2: Extract basic info from resume
        extraction_result = extract_resume_info(resume_text, settings)

        # Step 3: Analyze against job requirements
        analysis_result = analyze_against_requirements(
            resume_text,
            job_requirements,
            extraction_result,
            settings
        )

        # Step 4: Calculate resume quality metrics
        experience_years = extraction_result.get("experience_years") or 0
        if not isinstance(experience_years, (int, float)):
            try:
                experience_years = int(float(experience_years))
            except (ValueError, TypeError):
                experience_years = 0
        quality_metrics = calculate_resume_quality_metrics(resume_text, experience_years)

        # Step 5: Calculate individual signal scores
        signal_scores = {
            "experience_relevance_score": analysis_result.get("experience_relevance_score", 50),
            "technical_skills_score": analysis_result.get("technical_skills_score", 50),
            "business_impact_score": analysis_result.get("business_impact_score", 50),
            "proof_of_work_score": max(github_score, analysis_result.get("proof_of_work_score", 0)),
            "career_growth_score": analysis_result.get("career_growth_score", 50),
            "certifications_score": analysis_result.get("certifications_score", 50),
            "soft_skills_score": analysis_result.get("soft_skills_score", 50),
            "resume_quality_score": quality_metrics["length_score"],
            "extracurriculars_score": analysis_result.get("extracurriculars_score", 50),
        }

        # Step 6: Calculate weighted overall score
        overall_score = calculate_weighted_score(signal_scores)

        # Step 7: Determine recommendation
        recommendation = get_recommendation(overall_score, analysis_result)

        # Step 8: Store analysis results (ensure all scores are integers)
        def to_int(val):
            """Convert value to int, handling floats and strings."""
            if val is None:
                return 0
            try:
                return int(float(val))
            except (ValueError, TypeError):
                return 0

        # Get signal evidence from analysis result
        signal_evidence = analysis_result.get("signal_evidence", {})

        # Add resume quality evidence if not present
        if "resume_quality" not in signal_evidence:
            signal_evidence["resume_quality"] = []
            if quality_metrics.get("length_score", 0) >= 70:
                signal_evidence["resume_quality"].append("Well-structured resume")
            if quality_metrics.get("has_metrics", False):
                signal_evidence["resume_quality"].append("Includes quantified achievements")

        analysis_data = {
            "candidate_id": candidate_id,
            "overall_score": to_int(overall_score),
            "experience_relevance_score": to_int(signal_scores.get("experience_relevance_score")),
            "technical_skills_score": to_int(signal_scores.get("technical_skills_score")),
            "business_impact_score": to_int(signal_scores.get("business_impact_score")),
            "proof_of_work_score": to_int(signal_scores.get("proof_of_work_score")),
            "career_growth_score": to_int(signal_scores.get("career_growth_score")),
            "certifications_score": to_int(signal_scores.get("certifications_score")),
            "soft_skills_score": to_int(signal_scores.get("soft_skills_score")),
            "resume_quality_score": to_int(signal_scores.get("resume_quality_score")),
            "extracurriculars_score": to_int(signal_scores.get("extracurriculars_score")),
            "experience_years": to_int(experience_years),
            "skills_matched": analysis_result.get("skills_matched", {}),
            "skills_missing": analysis_result.get("skills_missing", []),
            "certifications": extraction_result.get("certifications", []),
            "education": extraction_result.get("education", []),
            "proof_of_work_links": extraction_result.get("proof_of_work_links", []),
            "green_flags": analysis_result.get("green_flags", []),
            "yellow_flags": analysis_result.get("yellow_flags", []),
            "red_flags": analysis_result.get("red_flags", []),
            "summary": analysis_result.get("summary", ""),
            "recommendation": recommendation,
            "signal_evidence": signal_evidence,
        }

        # Upsert analysis results
        supabase.table("analysis_results").upsert(
            analysis_data,
            on_conflict="candidate_id"
        ).execute()

        # Update candidate status to reviewed
        supabase.table("candidates").update({
            "status": "reviewed"
        }).eq("id", candidate_id).execute()

    except Exception as e:
        # Log error and update status
        print(f"Analysis error for candidate {candidate_id}: {e}")
        supabase.table("candidates").update({
            "status": "pending"  # Reset to pending on error
        }).eq("id", candidate_id).execute()
        raise


def extract_resume_info(resume_text: str, settings) -> dict:
    """Extract structured info from resume using LLM."""
    prompt = get_extraction_prompt(resume_text)
    content = call_llm(prompt, settings)

    try:
        result = json.loads(content)
        return result
    except json.JSONDecodeError:
        # Try to extract JSON from response
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return {}


def analyze_against_requirements(
    resume_text: str,
    job_requirements: str,
    extraction_result: dict,
    settings
) -> dict:
    """Analyze resume against job requirements using LLM."""
    prompt = get_analysis_prompt(resume_text, job_requirements, extraction_result)
    content = call_llm(prompt, settings)

    try:
        result = json.loads(content)
        return result
    except json.JSONDecodeError:
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return {}


def get_recommendation(overall_score: int, analysis: dict) -> str:
    """Determine recommendation based on score and flags."""
    red_flags = analysis.get("red_flags", [])

    # Check for critical red flags
    if len(red_flags) >= 3:
        return "no"

    if overall_score >= 80:
        return "strong_yes"
    elif overall_score >= 65:
        return "yes"
    elif overall_score >= 45:
        return "maybe"
    else:
        return "no"
