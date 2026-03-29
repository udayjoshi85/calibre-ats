"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Job, Candidate } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeUpload } from "@/components/ResumeUpload";
import { CandidateCard } from "@/components/CandidateCard";

interface JobPageProps {
  params: Promise<{ id: string }>;
}

export default function JobPage({ params }: JobPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [jobData, candidatesData] = await Promise.all([
        api.getJob(id),
        api.getCandidates(id),
      ]);
      setJob(jobData);
      setCandidates(candidatesData);
    } catch (err) {
      setError("Failed to load job");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (
    file: File,
    info: { name: string; email?: string; phone?: string }
  ) => {
    const newCandidate = await api.uploadResume(id, file, info);
    setCandidates([newCandidate, ...candidates]);
  };

  const handleStatusChange = async (candidateId: string, status: string) => {
    try {
      const updated = await api.updateCandidateStatus(candidateId, status);
      setCandidates(
        candidates.map((c) => (c.id === candidateId ? { ...c, ...updated } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (candidateId: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
      await api.deleteCandidate(candidateId);
      setCandidates(candidates.filter((c) => c.id !== candidateId));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCandidates =
    statusFilter === "all"
      ? candidates
      : candidates.filter((c) => c.status === statusFilter);

  // Sort by score (descending)
  const sortedCandidates = [...filteredCandidates].sort(
    (a, b) => (b.overall_score ?? 0) - (a.overall_score ?? 0)
  );

  const statusCounts = {
    all: candidates.length,
    pending: candidates.filter((c) => c.status === "pending").length,
    analyzing: candidates.filter((c) => c.status === "analyzing").length,
    reviewed: candidates.filter((c) => c.status === "reviewed").length,
    shortlisted: candidates.filter((c) => c.status === "shortlisted").length,
    rejected: candidates.filter((c) => c.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin"></div>
        </div>
        <p className="text-gray-500 font-medium">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{error || "Job not found"}</h3>
        <Link href="/jobs">
          <Button variant="outline" className="rounded-xl">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Jobs
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
                <p className="text-gray-500">{job.description || "No description provided"}</p>
              </div>
            </div>
            <Button onClick={() => setUploadOpen(true)} className="btn-primary rounded-xl h-11 px-5 flex-shrink-0">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Resume
            </Button>
          </div>

          {/* Requirements Section */}
          {job.requirements && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Requirements
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-xl p-4">
                {job.requirements}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Candidates Section */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Candidates
            <span className="text-base font-normal text-gray-400">({candidates.length})</span>
          </h2>
        </div>

        <Tabs
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="mb-6"
        >
          <TabsList className="bg-gray-100/80 p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="reviewed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Reviewed ({statusCounts.reviewed})
            </TabsTrigger>
            <TabsTrigger value="shortlisted" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Shortlisted ({statusCounts.shortlisted})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Rejected ({statusCounts.rejected})
            </TabsTrigger>
            <TabsTrigger value="analyzing" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Analyzing ({statusCounts.analyzing})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {sortedCandidates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {statusFilter === "all" ? "No candidates yet" : `No ${statusFilter} candidates`}
              </h3>
              <p className="text-gray-500 mb-6 text-center max-w-sm">
                {statusFilter === "all"
                  ? "Upload your first resume to get AI-powered analysis"
                  : "Candidates will appear here when their status changes"}
              </p>
              {statusFilter === "all" && (
                <Button onClick={() => setUploadOpen(true)} className="btn-primary rounded-xl">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload First Resume
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sortedCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <ResumeUpload
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={handleUpload}
      />
    </div>
  );
}
