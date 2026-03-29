from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from typing import List, Optional
from uuid import UUID

from app.models.schemas import (
    CandidateResponse,
    CandidateDetailResponse,
    CandidateStatusUpdate,
    RankingResponse
)
from app.services.database import get_supabase_client
from app.services.resume_parser import parse_resume, extract_profile_links
from app.services.enrichment import enrich_github_profile
from app.services.ai_analyzer import analyze_candidate

router = APIRouter()


@router.post("/jobs/{job_id}/candidates", response_model=CandidateResponse)
async def upload_candidate(
    job_id: UUID,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    name: str = Form(...),
    email: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
):
    """Upload a resume for a job and trigger analysis."""
    supabase = get_supabase_client()

    # Verify job exists
    job_result = supabase.table("jobs").select("id, requirements").eq("id", str(job_id)).single().execute()
    if not job_result.data:
        raise HTTPException(status_code=404, detail="Job not found")

    # Read file content
    content = await file.read()
    filename = file.filename or "resume"

    # Upload to Supabase Storage
    storage_path = f"resumes/{job_id}/{filename}"
    storage_result = supabase.storage.from_("resumes").upload(storage_path, content)

    # Get public URL
    resume_url = supabase.storage.from_("resumes").get_public_url(storage_path)

    # Parse resume text
    resume_text = parse_resume(content, filename)

    # Extract profile links from resume
    profile_links = extract_profile_links(resume_text)

    # Create candidate record
    candidate_data = {
        "job_id": str(job_id),
        "name": name,
        "email": email,
        "phone": phone,
        "resume_url": resume_url,
        "resume_text": resume_text,
        "status": "analyzing",
        "linkedin_url": profile_links.get("linkedin"),
        "github_url": profile_links.get("github"),
        "portfolio_url": profile_links.get("portfolio"),
        "notion_url": profile_links.get("notion"),
    }

    result = supabase.table("candidates").insert(candidate_data).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create candidate")

    candidate = result.data[0]

    # Trigger background analysis
    background_tasks.add_task(
        analyze_candidate,
        candidate_id=candidate["id"],
        resume_text=resume_text,
        job_requirements=job_result.data.get("requirements", ""),
        github_url=profile_links.get("github"),
    )

    return candidate


@router.get("/jobs/{job_id}/candidates", response_model=List[CandidateResponse])
async def list_candidates(
    job_id: UUID,
    status: Optional[str] = None,
    sort_by: str = "overall_score",
    sort_order: str = "desc",
):
    """List candidates for a job, sorted by score."""
    supabase = get_supabase_client()

    try:
        # Build query
        query = supabase.table("candidates").select(
            "*, analysis_results(overall_score)"
        ).eq("job_id", str(job_id))

        if status:
            query = query.eq("status", status)

        result = query.execute()

        # Flatten and add overall_score
        candidates = []
        for row in result.data:
            analysis = row.pop("analysis_results", None)
            # Handle different formats: could be list, dict, or None
            if isinstance(analysis, list) and len(analysis) > 0:
                overall_score = analysis[0].get("overall_score")
            elif isinstance(analysis, dict):
                overall_score = analysis.get("overall_score")
            else:
                overall_score = None
            candidates.append({**row, "overall_score": overall_score})

        # Sort by score
        if sort_by == "overall_score":
            candidates.sort(
                key=lambda x: x.get("overall_score") or 0,
                reverse=(sort_order == "desc")
            )

        return candidates
    except Exception as e:
        print(f"Error listing candidates: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/candidates/{candidate_id}")
async def get_candidate(candidate_id: UUID):
    """Get detailed candidate info with analysis."""
    supabase = get_supabase_client()

    try:
        result = supabase.table("candidates").select(
            "*, analysis_results(*)"
        ).eq("id", str(candidate_id)).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Candidate not found")

        candidate = result.data
        analysis_data = candidate.pop("analysis_results", None)

        # Handle different formats: could be list, dict, or None
        if isinstance(analysis_data, list) and len(analysis_data) > 0:
            analysis = analysis_data[0]
        elif isinstance(analysis_data, dict):
            analysis = analysis_data
        else:
            analysis = None

        # Transform analysis to expected format
        if analysis:
            analysis["signal_scores"] = {
                "experience_relevance": analysis.get("experience_relevance_score", 0) or 0,
                "technical_skills": analysis.get("technical_skills_score", 0) or 0,
                "business_impact": analysis.get("business_impact_score", 0) or 0,
                "proof_of_work": analysis.get("proof_of_work_score", 0) or 0,
                "career_growth": analysis.get("career_growth_score", 0) or 0,
                "certifications": analysis.get("certifications_score", 0) or 0,
                "soft_skills": analysis.get("soft_skills_score", 0) or 0,
                "resume_quality": analysis.get("resume_quality_score", 0) or 0,
                "extracurriculars": analysis.get("extracurriculars_score", 0) or 0,
            }

        return {
            **candidate,
            "overall_score": analysis.get("overall_score") if analysis else None,
            "analysis": analysis
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting candidate {candidate_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/candidates/{candidate_id}/status", response_model=CandidateResponse)
async def update_candidate_status(candidate_id: UUID, status_update: CandidateStatusUpdate):
    """Update candidate status (shortlist, reject, etc.)."""
    supabase = get_supabase_client()

    valid_statuses = ["pending", "analyzing", "reviewed", "shortlisted", "rejected"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    result = supabase.table("candidates").update({
        "status": status_update.status
    }).eq("id", str(candidate_id)).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Candidate not found")

    return result.data[0]


@router.delete("/candidates/{candidate_id}")
async def delete_candidate(candidate_id: UUID):
    """Delete a candidate."""
    supabase = get_supabase_client()

    result = supabase.table("candidates").delete().eq("id", str(candidate_id)).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Candidate not found")

    return {"message": "Candidate deleted successfully"}


@router.get("/jobs/{job_id}/rankings", response_model=RankingResponse)
async def get_rankings(job_id: UUID, limit: int = 10):
    """Get ranked candidates for a job."""
    supabase = get_supabase_client()

    result = supabase.table("candidates").select(
        "*, analysis_results(overall_score)"
    ).eq("job_id", str(job_id)).execute()

    # Flatten and sort by score
    candidates = []
    for row in result.data:
        analysis = row.pop("analysis_results", [])
        overall_score = analysis[0]["overall_score"] if analysis else 0
        candidates.append({**row, "overall_score": overall_score})

    candidates.sort(key=lambda x: x.get("overall_score") or 0, reverse=True)

    return {
        "candidates": candidates[:limit],
        "total": len(candidates)
    }
