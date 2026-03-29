"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Job, JobCreate } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<JobCreate>({
    title: "",
    description: "",
    requirements: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await api.getJobs();
      setJobs(data);
    } catch (err) {
      setError("Failed to load jobs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const newJob = await api.createJob(formData);
      setJobs([newJob, ...jobs]);
      setIsDialogOpen(false);
      setFormData({ title: "", description: "", requirements: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      await api.deleteJob(id);
      setJobs(jobs.filter((j) => j.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin"></div>
        </div>
        <p className="text-gray-400 font-medium">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Jobs</h1>
          <p className="text-gray-400 mt-1">
            Manage your job postings and review candidates
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="btn-accent rounded-xl h-11 px-5" />}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Job
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-2xl bg-[#1a1a2e] border-white/10">
            <form onSubmit={handleCreateJob}>
              <DialogHeader>
                <DialogTitle className="text-xl text-white">Create New Job</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add a new job posting to start receiving candidates
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300 font-medium">Job Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300 font-medium">Description</Label>
                  <textarea
                    id="description"
                    className="w-full min-h-[100px] px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none resize-none"
                    placeholder="Describe the role and responsibilities..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements" className="text-gray-300 font-medium">Requirements</Label>
                  <textarea
                    id="requirements"
                    className="w-full min-h-[100px] px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none resize-none"
                    placeholder="List required skills, experience, qualifications..."
                    value={formData.requirements}
                    onChange={(e) =>
                      setFormData({ ...formData, requirements: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-xl border-white/10 text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="btn-accent rounded-xl">
                  {creating ? (
                    <div className="flex items-center gap-2">
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    "Create Job"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 mb-6 text-red-400 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <div className="bg-[#1a1a2e] rounded-2xl border border-white/10">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No jobs yet</h3>
            <p className="text-gray-400 mb-6 text-center max-w-sm">
              Create your first job posting to start screening candidates with AI
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="btn-accent rounded-xl">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create your first job
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group bg-[#1a1a2e] rounded-2xl border border-white/10 p-6 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-sm font-medium border border-cyan-500/20">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {job.candidate_count || 0}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors mb-2">
                  {job.title}
                </h3>

                <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                  {job.description || "No description provided"}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-gray-500">
                    Created {new Date(job.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteJob(job.id);
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                    <div className="flex items-center text-cyan-400 text-sm font-medium">
                      View
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
