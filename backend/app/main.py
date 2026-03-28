from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import jobs, candidates, analysis

settings = get_settings()

app = FastAPI(
    title="Calibre API",
    description="AI-powered Applicant Tracking System with Signal Extraction",
    version="1.0.0",
)

# CORS middleware - parse origins from comma-separated string
cors_origins = [origin.strip() for origin in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(candidates.router, prefix="/api", tags=["candidates"])
app.include_router(analysis.router, prefix="/api", tags=["analysis"])


@app.get("/")
async def root():
    return {"message": "Calibre API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
