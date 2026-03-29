"""Prompt templates for Ollama AI extraction and analysis."""


def get_extraction_prompt(resume_text: str) -> str:
    """Generate prompt for extracting structured info from resume."""
    return f"""You are a resume parser. Extract structured information from the following resume.

RESUME:
{resume_text}

Return a JSON object with the following fields:
{{
    "name": "Full name of the candidate",
    "email": "Email address if found",
    "phone": "Phone number if found",
    "experience_years": <number of years of professional experience>,
    "current_role": "Current or most recent job title",
    "current_company": "Current or most recent company",
    "skills": ["list", "of", "technical", "skills"],
    "certifications": [
        {{"name": "Certification name", "issuer": "Issuing organization", "year": 2023}}
    ],
    "education": [
        {{"degree": "Degree name", "institution": "University name", "year": 2020}}
    ],
    "proof_of_work_links": [
        {{"type": "github|linkedin|portfolio|notion", "url": "URL"}}
    ],
    "languages": ["Programming languages"],
    "soft_skills": ["leadership", "communication", "etc"],
    "achievements": ["Notable achievements or awards"]
}}

Be precise and extract only what is explicitly stated. If information is not found, use null or empty arrays."""


def get_analysis_prompt(resume_text: str, job_requirements: str, extraction: dict) -> str:
    """Generate prompt for analyzing resume against job requirements."""
    return f"""You are an expert recruiter analyzing a candidate's fit for a role.

JOB REQUIREMENTS:
{job_requirements if job_requirements else "No specific requirements provided. Evaluate general quality."}

RESUME:
{resume_text}

EXTRACTED INFO:
{extraction}

Analyze this candidate and return a JSON object with:
{{
    "experience_relevance_score": <0-100, how relevant is their experience to this role>,
    "technical_skills_score": <0-100, how well do their skills match requirements>,
    "business_impact_score": <0-100, evidence of measurable business outcomes>,
    "proof_of_work_score": <0-100, evidence of work (projects, portfolio, etc)>,
    "career_growth_score": <0-100, progression in responsibility over time>,
    "certifications_score": <0-100, relevance of certifications>,
    "soft_skills_score": <0-100, evidence of leadership, communication, etc>,
    "extracurriculars_score": <0-100, relevant side projects, community involvement>,

    "signal_evidence": {{
        "experience_relevance": ["Direct quote or paraphrase from resume showing relevant experience", "Another evidence point"],
        "technical_skills": ["Built ETL pipeline processing 2M records/day", "Used Snowflake in production system"],
        "business_impact": ["Increased revenue by 25%", "Reduced processing time by 40%"],
        "proof_of_work": ["GitHub: 50+ repos with 500 stars", "Published technical blog with 10K readers"],
        "career_growth": ["Promoted from Engineer to Senior in 2 years", "Grew team from 3 to 12 members"],
        "certifications": ["AWS Solutions Architect - relevant for cloud role", "PMP certified"],
        "soft_skills": ["Led cross-functional team of 8", "Mentored 5 junior developers"],
        "resume_quality": ["Clear structure", "Quantified achievements"],
        "extracurriculars": ["Open source contributor to React", "Tech conference speaker"]
    }},

    "skills_matched": {{"skill_name": <relevance_score 0-100>}},
    "skills_missing": ["required skills not found in resume"],

    "green_flags": [
        "Positive signals - ownership, impact, growth trajectory"
    ],
    "yellow_flags": [
        "Cautionary signals - gaps, frequent changes, etc"
    ],
    "red_flags": [
        "Serious concerns - misalignment, missing critical skills"
    ],

    "summary": "2-3 sentence summary of the candidate's fit"
}}

IMPORTANT FOR signal_evidence:
- Extract SPECIFIC quotes or paraphrased statements from the resume
- Each evidence should be a concise, impactful statement (max 50 characters)
- Include 1-3 evidence points per signal (only if found in resume)
- If no evidence found for a signal, use an empty array []

SCORING GUIDELINES:
- 80-100: Exceptional evidence, exceeds expectations
- 60-79: Good evidence, meets expectations
- 40-59: Some evidence, partially meets expectations
- 20-39: Limited evidence, below expectations
- 0-19: No evidence or significant concerns

Focus on:
1. Did they OWN outcomes or just execute tasks?
2. Is there EVIDENCE of impact (metrics, results)?
3. Are skills DEMONSTRATED through projects or just listed?
4. Is there GROWTH in responsibility over time?"""
