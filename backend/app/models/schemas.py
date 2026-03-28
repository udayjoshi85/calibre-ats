from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID


# === Job Schemas ===

class JobCreate(BaseModel):
    title: str
    description: Optional[str] = None
    requirements: Optional[str] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None


class JobResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    requirements: Optional[str]
    created_at: datetime
    updated_at: datetime
    candidate_count: Optional[int] = 0


# === Candidate Schemas ===

class CandidateCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class CandidateStatusUpdate(BaseModel):
    status: str  # pending, analyzing, reviewed, shortlisted, rejected


class CandidateResponse(BaseModel):
    id: UUID
    job_id: UUID
    name: str
    email: Optional[str]
    phone: Optional[str]
    resume_url: Optional[str]
    status: str
    linkedin_url: Optional[str]
    github_url: Optional[str]
    portfolio_url: Optional[str]
    notion_url: Optional[str]
    created_at: datetime
    overall_score: Optional[int] = None


class CandidateDetailResponse(CandidateResponse):
    resume_text: Optional[str]
    github_data: Optional[dict]
    analysis: Optional["AnalysisResponse"] = None


# === Analysis Schemas ===

class SignalScores(BaseModel):
    experience_relevance: int
    technical_skills: int
    business_impact: int
    proof_of_work: int
    career_growth: int
    certifications: int
    soft_skills: int
    resume_quality: int
    extracurriculars: int


class AnalysisResponse(BaseModel):
    id: UUID
    candidate_id: UUID
    overall_score: int
    signal_scores: SignalScores
    experience_years: Optional[int]
    skills_matched: Optional[dict]
    skills_missing: Optional[list]
    certifications: Optional[list]
    education: Optional[list]
    proof_of_work_links: Optional[list]
    green_flags: Optional[list]
    yellow_flags: Optional[list]
    red_flags: Optional[list]
    summary: Optional[str]
    recommendation: str  # strong_yes, yes, maybe, no
    created_at: datetime


# === Comparison Schemas ===

class CompareRequest(BaseModel):
    candidate_ids: list[UUID]


class RankingResponse(BaseModel):
    candidates: list[CandidateResponse]
    total: int


# Resolve forward references
CandidateDetailResponse.model_rebuild()
