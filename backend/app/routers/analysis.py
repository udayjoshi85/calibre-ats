from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
from uuid import UUID

from app.models.schemas import AnalysisResponse, CompareRequest
from app.services.database import get_supabase_client
from app.services.ai_analyzer import analyze_candidate
from app.services.enrichment import enrich_github_profile

router = APIRouter()


@router.post("/candidates/{candidate_id}/analyze", response_model=dict)
async def trigger_analysis(candidate_id: UUID, background_tasks: BackgroundTasks):
    """Manually trigger AI analysis for a candidate."""
    supabase = get_supabase_client()

    # Get candidate with job requirements
    result = supabase.table("candidates").select(
        "*, jobs(requirements)"
    ).eq("id", str(candidate_id)).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate = result.data
    job = candidate.pop("jobs", {})

    # Update status to analyzing
    supabase.table("candidates").update({"status": "analyzing"}).eq("id", str(candidate_id)).execute()

    # Trigger background analysis
    background_tasks.add_task(
        analyze_candidate,
        candidate_id=str(candidate_id),
        resume_text=candidate.get("resume_text", ""),
        job_requirements=job.get("requirements", ""),
        github_url=candidate.get("github_url"),
    )

    return {"message": "Analysis started", "candidate_id": str(candidate_id)}


@router.post("/candidates/{candidate_id}/enrich", response_model=dict)
async def trigger_enrichment(candidate_id: UUID):
    """Fetch GitHub data for a candidate."""
    supabase = get_supabase_client()

    # Get candidate
    result = supabase.table("candidates").select("github_url").eq("id", str(candidate_id)).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Candidate not found")

    github_url = result.data.get("github_url")
    if not github_url:
        raise HTTPException(status_code=400, detail="No GitHub URL found for this candidate")

    # Fetch GitHub data
    github_data = await enrich_github_profile(github_url)

    # Update candidate
    supabase.table("candidates").update({
        "github_data": github_data
    }).eq("id", str(candidate_id)).execute()

    return {"message": "Enrichment complete", "github_data": github_data}


@router.get("/candidates/{candidate_id}/signals", response_model=AnalysisResponse)
async def get_signals(candidate_id: UUID):
    """Get signal breakdown for a candidate."""
    supabase = get_supabase_client()

    result = supabase.table("analysis_results").select("*").eq(
        "candidate_id", str(candidate_id)
    ).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Analysis not found for this candidate")

    analysis = result.data

    # Transform to expected format
    return {
        **analysis,
        "signal_scores": {
            "experience_relevance": analysis.get("experience_relevance_score", 0),
            "technical_skills": analysis.get("technical_skills_score", 0),
            "business_impact": analysis.get("business_impact_score", 0),
            "proof_of_work": analysis.get("proof_of_work_score", 0),
            "career_growth": analysis.get("career_growth_score", 0),
            "certifications": analysis.get("certifications_score", 0),
            "soft_skills": analysis.get("soft_skills_score", 0),
            "resume_quality": analysis.get("resume_quality_score", 0),
            "extracurriculars": analysis.get("extracurriculars_score", 0),
        }
    }


@router.post("/jobs/{job_id}/compare", response_model=List[AnalysisResponse])
async def compare_candidates(job_id: UUID, request: CompareRequest):
    """Compare multiple candidates side-by-side."""
    supabase = get_supabase_client()

    candidate_ids = [str(cid) for cid in request.candidate_ids]

    result = supabase.table("analysis_results").select("*").in_(
        "candidate_id", candidate_ids
    ).execute()

    # Transform each analysis
    analyses = []
    for analysis in result.data:
        analyses.append({
            **analysis,
            "signal_scores": {
                "experience_relevance": analysis.get("experience_relevance_score", 0),
                "technical_skills": analysis.get("technical_skills_score", 0),
                "business_impact": analysis.get("business_impact_score", 0),
                "proof_of_work": analysis.get("proof_of_work_score", 0),
                "career_growth": analysis.get("career_growth_score", 0),
                "certifications": analysis.get("certifications_score", 0),
                "soft_skills": analysis.get("soft_skills_score", 0),
                "resume_quality": analysis.get("resume_quality_score", 0),
                "extracurriculars": analysis.get("extracurriculars_score", 0),
            }
        })

    return analyses
