// Job types
export interface Job {
  id: string;
  title: string;
  description: string | null;
  requirements: string | null;
  created_at: string;
  updated_at: string;
  candidate_count?: number;
}

export interface JobCreate {
  title: string;
  description?: string;
  requirements?: string;
}

// Candidate types
export type CandidateStatus =
  | "pending"
  | "analyzing"
  | "reviewed"
  | "shortlisted"
  | "rejected";

export interface Candidate {
  id: string;
  job_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  resume_url: string | null;
  status: CandidateStatus;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  notion_url: string | null;
  created_at: string;
  overall_score: number | null;
}

export interface CandidateDetail extends Candidate {
  resume_text: string | null;
  github_data: GitHubData | null;
  analysis: Analysis | null;
}

// Analysis types
export interface SignalScores {
  experience_relevance: number;
  technical_skills: number;
  business_impact: number;
  proof_of_work: number;
  career_growth: number;
  certifications: number;
  soft_skills: number;
  resume_quality: number;
  extracurriculars: number;
}

export type Recommendation = "strong_yes" | "yes" | "maybe" | "no";

export interface SignalEvidence {
  experience_relevance?: string[];
  technical_skills?: string[];
  business_impact?: string[];
  proof_of_work?: string[];
  career_growth?: string[];
  certifications?: string[];
  soft_skills?: string[];
  resume_quality?: string[];
  extracurriculars?: string[];
}

export interface Analysis {
  id: string;
  candidate_id: string;
  overall_score: number;
  signal_scores: SignalScores;
  signal_evidence: SignalEvidence | null;
  experience_years: number | null;
  skills_matched: Record<string, number> | null;
  skills_missing: string[] | null;
  certifications: Certification[] | null;
  education: Education[] | null;
  proof_of_work_links: ProofOfWorkLink[] | null;
  green_flags: string[] | null;
  yellow_flags: string[] | null;
  red_flags: string[] | null;
  summary: string | null;
  recommendation: Recommendation;
  created_at: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year?: number;
}

export interface Education {
  degree: string;
  institution: string;
  year?: number;
}

export interface ProofOfWorkLink {
  type: "github" | "linkedin" | "portfolio" | "notion";
  url: string;
}

// GitHub enrichment
export interface GitHubData {
  username: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  languages: Record<string, number>;
  top_repos: GitHubRepo[];
  total_stars: number;
  activity_score: number;
  profile_url: string;
  error?: string;
}

export interface GitHubRepo {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string | null;
  url: string;
}

// API response types
export interface RankingResponse {
  candidates: Candidate[];
  total: number;
}
