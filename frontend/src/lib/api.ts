import type {
  Job,
  JobCreate,
  Candidate,
  CandidateDetail,
  Analysis,
  RankingResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP error ${response.status}`);
    }

    return response.json();
  }

  // Jobs
  async getJobs(): Promise<Job[]> {
    return this.fetch<Job[]>("/api/jobs");
  }

  async getJob(id: string): Promise<Job> {
    return this.fetch<Job>(`/api/jobs/${id}`);
  }

  async createJob(job: JobCreate): Promise<Job> {
    return this.fetch<Job>("/api/jobs", {
      method: "POST",
      body: JSON.stringify(job),
    });
  }

  async updateJob(id: string, job: Partial<JobCreate>): Promise<Job> {
    return this.fetch<Job>(`/api/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(job),
    });
  }

  async deleteJob(id: string): Promise<void> {
    await this.fetch(`/api/jobs/${id}`, { method: "DELETE" });
  }

  // Candidates
  async getCandidates(jobId: string, status?: string): Promise<Candidate[]> {
    const params = status ? `?status=${status}` : "";
    return this.fetch<Candidate[]>(`/api/jobs/${jobId}/candidates${params}`);
  }

  async getCandidate(id: string): Promise<CandidateDetail> {
    return this.fetch<CandidateDetail>(`/api/candidates/${id}`);
  }

  async uploadResume(
    jobId: string,
    file: File,
    candidateInfo: { name: string; email?: string; phone?: string }
  ): Promise<Candidate> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", candidateInfo.name);
    if (candidateInfo.email) formData.append("email", candidateInfo.email);
    if (candidateInfo.phone) formData.append("phone", candidateInfo.phone);

    const response = await fetch(
      `${this.baseUrl}/api/jobs/${jobId}/candidates`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to upload resume");
    }

    return response.json();
  }

  async updateCandidateStatus(
    id: string,
    status: string
  ): Promise<Candidate> {
    return this.fetch<Candidate>(`/api/candidates/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async deleteCandidate(id: string): Promise<void> {
    await this.fetch(`/api/candidates/${id}`, { method: "DELETE" });
  }

  // Analysis
  async triggerAnalysis(candidateId: string): Promise<{ message: string }> {
    return this.fetch(`/api/candidates/${candidateId}/analyze`, {
      method: "POST",
    });
  }

  async getSignals(candidateId: string): Promise<Analysis> {
    return this.fetch<Analysis>(`/api/candidates/${candidateId}/signals`);
  }

  async enrichCandidate(
    candidateId: string
  ): Promise<{ message: string; github_data: Record<string, unknown> }> {
    return this.fetch(`/api/candidates/${candidateId}/enrich`, {
      method: "POST",
    });
  }

  // Rankings
  async getRankings(jobId: string, limit?: number): Promise<RankingResponse> {
    const params = limit ? `?limit=${limit}` : "";
    return this.fetch<RankingResponse>(`/api/jobs/${jobId}/rankings${params}`);
  }

  async compareCandidates(
    jobId: string,
    candidateIds: string[]
  ): Promise<Analysis[]> {
    return this.fetch<Analysis[]>(`/api/jobs/${jobId}/compare`, {
      method: "POST",
      body: JSON.stringify({ candidate_ids: candidateIds }),
    });
  }
}

export const api = new ApiClient(API_URL);
