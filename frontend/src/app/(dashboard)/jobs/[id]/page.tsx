"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Job, Candidate } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || "Job not found"}</p>
        <Link href="/jobs">
          <Button variant="outline">Back to Jobs</Button>
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
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          &larr; Back to Jobs
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-600 mt-1">{job.description}</p>
          </div>
          <Button onClick={() => setUploadOpen(true)}>Upload Resume</Button>
        </div>
      </div>

      {/* Requirements Section */}
      {job.requirements && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Requirements</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {job.requirements}
          </p>
        </div>
      )}

      {/* Candidates Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Candidates ({candidates.length})
          </h2>
        </div>

        <Tabs
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="all">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Reviewed ({statusCounts.reviewed})
            </TabsTrigger>
            <TabsTrigger value="shortlisted">
              Shortlisted ({statusCounts.shortlisted})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({statusCounts.rejected})
            </TabsTrigger>
            <TabsTrigger value="analyzing">
              Analyzing ({statusCounts.analyzing})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {sortedCandidates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">
              {statusFilter === "all"
                ? "No candidates yet"
                : `No ${statusFilter} candidates`}
            </p>
            {statusFilter === "all" && (
              <Button onClick={() => setUploadOpen(true)}>
                Upload First Resume
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
