from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID

from app.models.schemas import JobCreate, JobUpdate, JobResponse
from app.services.database import get_supabase_client

router = APIRouter()


@router.post("", response_model=JobResponse)
async def create_job(job: JobCreate):
    """Create a new job posting."""
    supabase = get_supabase_client()

    result = supabase.table("jobs").insert({
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create job")

    return {**result.data[0], "candidate_count": 0}


@router.get("", response_model=List[JobResponse])
async def list_jobs():
    """List all jobs with candidate counts."""
    supabase = get_supabase_client()

    # Get jobs
    jobs_result = supabase.table("jobs").select("*").order("created_at", desc=True).execute()

    # Get candidate counts per job
    jobs_with_counts = []
    for job in jobs_result.data:
        count_result = supabase.table("candidates").select("id", count="exact").eq("job_id", job["id"]).execute()
        jobs_with_counts.append({
            **job,
            "candidate_count": count_result.count or 0
        })

    return jobs_with_counts


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: UUID):
    """Get a specific job by ID."""
    supabase = get_supabase_client()

    result = supabase.table("jobs").select("*").eq("id", str(job_id)).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")

    # Get candidate count
    count_result = supabase.table("candidates").select("id", count="exact").eq("job_id", str(job_id)).execute()

    return {**result.data, "candidate_count": count_result.count or 0}


@router.put("/{job_id}", response_model=JobResponse)
async def update_job(job_id: UUID, job: JobUpdate):
    """Update a job posting."""
    supabase = get_supabase_client()

    update_data = job.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = supabase.table("jobs").update(update_data).eq("id", str(job_id)).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")

    return {**result.data[0], "candidate_count": 0}


@router.delete("/{job_id}")
async def delete_job(job_id: UUID):
    """Delete a job posting."""
    supabase = get_supabase_client()

    result = supabase.table("jobs").delete().eq("id", str(job_id)).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")

    return {"message": "Job deleted successfully"}
