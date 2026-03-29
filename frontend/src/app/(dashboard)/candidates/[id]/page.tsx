"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { CandidateDetail } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignalCard } from "@/components/SignalCard";
import { FlagsList } from "@/components/FlagsList";

interface CandidatePageProps {
  params: Promise<{ id: string }>;
}

const SIGNAL_LABELS: Record<string, { label: string; weight: number }> = {
  experience_relevance: { label: "Experience Relevance", weight: 20 },
  technical_skills: { label: "Technical Skills", weight: 15 },
  business_impact: { label: "Business Impact", weight: 20 },
  proof_of_work: { label: "Proof of Work", weight: 15 },
  career_growth: { label: "Career Growth", weight: 10 },
  certifications: { label: "Certifications", weight: 5 },
  soft_skills: { label: "Soft Skills", weight: 5 },
  resume_quality: { label: "Resume Quality", weight: 5 },
  extracurriculars: { label: "Extracurriculars", weight: 5 },
};

const recommendationStyles: Record<string, string> = {
  strong_yes: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  yes: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  maybe: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  no: "bg-red-500/20 text-red-400 border-red-500/30",
};

const recommendationLabels: Record<string, string> = {
  strong_yes: "Strong Yes",
  yes: "Yes",
  maybe: "Maybe",
  no: "No",
};

export default function CandidatePage({ params }: CandidatePageProps) {
  const { id } = use(params);
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCandidate();
  }, [id]);

  const loadCandidate = async () => {
    try {
      const data = await api.getCandidate(id);
      setCandidate(data);
    } catch (err) {
      setError("Failed to load candidate");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!candidate) return;
    try {
      const updated = await api.updateCandidateStatus(id, status);
      setCandidate({ ...candidate, ...updated });
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
        <p className="text-gray-400 font-medium">Loading candidate...</p>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{error || "Candidate not found"}</h3>
        <Link href="/jobs">
          <Button variant="outline" className="rounded-xl border-white/10 text-gray-300 hover:bg-white/5">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const analysis = candidate.analysis;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/jobs/${candidate.job_id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-cyan-400 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Candidates
        </Link>

        <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div className="flex items-center gap-4">
              {/* Score Circle - Updated colors: red <60, orange 60-80, green 80+ */}
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg ${
                  candidate.overall_score !== null
                    ? candidate.overall_score >= 80
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white ring-4 ring-emerald-500/30"
                      : candidate.overall_score >= 60
                      ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white ring-4 ring-orange-500/30"
                      : "bg-gradient-to-br from-red-400 to-red-600 text-white ring-4 ring-red-500/30"
                    : "bg-white/10 text-gray-400 ring-4 ring-white/10"
                }`}
              >
                {candidate.overall_score ?? "?"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {candidate.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  {analysis && (
                    <Badge
                      className={`${
                        recommendationStyles[analysis.recommendation]
                      } border`}
                    >
                      {recommendationLabels[analysis.recommendation]}
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-white/20 text-gray-300">{candidate.status}</Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-xl text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                onClick={() => handleStatusChange("shortlisted")}
                disabled={candidate.status === "shortlisted"}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Shortlist
              </Button>
              <Button
                variant="outline"
                className="rounded-xl text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                onClick={() => handleStatusChange("rejected")}
                disabled={candidate.status === "rejected"}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </Button>
            </div>
          </div>

          {/* Contact & Links */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
            {candidate.email && (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {candidate.email}
              </span>
            )}
            {candidate.phone && (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {candidate.phone}
              </span>
            )}
            {candidate.resume_url && (
              <a
                href={candidate.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Resume
              </a>
            )}
          </div>

          {/* Profile Links */}
          <div className="mt-4 flex flex-wrap gap-2">
            {candidate.linkedin_url && (
              <a
                href={candidate.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm hover:bg-blue-500/30 transition-colors font-medium border border-blue-500/20"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
            )}
            {candidate.github_url && (
              <a
                href={candidate.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-gray-300 rounded-full text-sm hover:bg-white/20 transition-colors font-medium border border-white/10"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            )}
            {candidate.portfolio_url && (
              <a
                href={candidate.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-sm hover:bg-purple-500/30 transition-colors font-medium border border-purple-500/20"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Portfolio
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {analysis?.summary && (
        <Card className="mb-6 bg-[#1a1a2e] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">{analysis.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="signals" className="space-y-6">
        <TabsList className="bg-[#1a1a2e] p-1 rounded-xl border border-white/10">
          <TabsTrigger value="signals" className="rounded-lg text-gray-400 data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:border data-[state=active]:border-cyan-500/20">Signal Breakdown</TabsTrigger>
          <TabsTrigger value="flags" className="rounded-lg text-gray-400 data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:border data-[state=active]:border-cyan-500/20">Flags</TabsTrigger>
          <TabsTrigger value="skills" className="rounded-lg text-gray-400 data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:border data-[state=active]:border-cyan-500/20">Skills</TabsTrigger>
          <TabsTrigger value="github" className="rounded-lg text-gray-400 data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:border data-[state=active]:border-cyan-500/20">GitHub</TabsTrigger>
        </TabsList>

        {/* Signals Tab */}
        <TabsContent value="signals">
          {analysis ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(analysis.signal_scores).map(([key, score]) => (
                <SignalCard
                  key={key}
                  label={SIGNAL_LABELS[key]?.label || key}
                  score={score}
                  weight={SIGNAL_LABELS[key]?.weight || 0}
                  evidence={analysis.signal_evidence?.[key as keyof typeof analysis.signal_evidence] || []}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">Analysis not available</p>
          )}
        </TabsContent>

        {/* Flags Tab */}
        <TabsContent value="flags">
          {analysis ? (
            <FlagsList
              greenFlags={analysis.green_flags || []}
              yellowFlags={analysis.yellow_flags || []}
              redFlags={analysis.red_flags || []}
            />
          ) : (
            <p className="text-gray-400 italic">Analysis not available</p>
          )}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          {analysis ? (
            <div className="space-y-6 bg-[#1a1a2e] rounded-2xl border border-white/10 p-6">
              {/* Matched Skills */}
              <div>
                <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Matched Skills
                </h3>
                {analysis.skills_matched &&
                Object.keys(analysis.skills_matched).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(analysis.skills_matched).map(
                      ([skill, score]) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className={
                            score >= 70
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : score >= 40
                              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                              : "bg-white/10 text-gray-300 border border-white/10"
                          }
                        >
                          {skill} ({score}%)
                        </Badge>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No skills matched
                  </p>
                )}
              </div>

              {/* Missing Skills */}
              <div>
                <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Missing Skills
                </h3>
                {analysis.skills_missing && analysis.skills_missing.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills_missing.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="border-red-500/30 text-red-400"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No missing skills identified
                  </p>
                )}
              </div>

              {/* Experience */}
              {analysis.experience_years !== null && (
                <div>
                  <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Experience
                  </h3>
                  <p className="text-gray-300">
                    {analysis.experience_years} years
                  </p>
                </div>
              )}

              {/* Certifications */}
              {analysis.certifications && analysis.certifications.length > 0 && (
                <div>
                  <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Certifications
                  </h3>
                  <ul className="space-y-1">
                    {analysis.certifications.map((cert, i) => (
                      <li key={i} className="text-sm text-gray-300">
                        {cert.name} - {cert.issuer}
                        {cert.year && ` (${cert.year})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Education */}
              {analysis.education && analysis.education.length > 0 && (
                <div>
                  <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                    Education
                  </h3>
                  <ul className="space-y-1">
                    {analysis.education.map((edu, i) => (
                      <li key={i} className="text-sm text-gray-300">
                        {edu.degree} - {edu.institution}
                        {edu.year && ` (${edu.year})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 italic">Analysis not available</p>
          )}
        </TabsContent>

        {/* GitHub Tab */}
        <TabsContent value="github">
          {candidate.github_data && !candidate.github_data.error ? (
            <div className="space-y-6">
              {/* Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[#1a1a2e] border-white/10">
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-white">
                      {candidate.github_data.public_repos}
                    </div>
                    <div className="text-sm text-gray-400">Repositories</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1a1a2e] border-white/10">
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-white">
                      {candidate.github_data.total_stars}
                    </div>
                    <div className="text-sm text-gray-400">Total Stars</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1a1a2e] border-white/10">
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-white">
                      {candidate.github_data.followers}
                    </div>
                    <div className="text-sm text-gray-400">Followers</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1a1a2e] border-white/10">
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                      {candidate.github_data.activity_score}
                    </div>
                    <div className="text-sm text-gray-400">Activity Score</div>
                  </CardContent>
                </Card>
              </div>

              {/* Languages */}
              {candidate.github_data.languages && (
                <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 p-6">
                  <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(candidate.github_data.languages).map(
                      ([lang, count]) => (
                        <Badge key={lang} variant="secondary" className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          {lang} ({count})
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Top Repos */}
              {candidate.github_data.top_repos &&
                candidate.github_data.top_repos.length > 0 && (
                  <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 p-6">
                    <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      Top Repositories
                    </h3>
                    <div className="space-y-3">
                      {candidate.github_data.top_repos.map((repo) => (
                        <a
                          key={repo.name}
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 bg-white/5 rounded-xl hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-white hover:text-cyan-400 transition-colors">
                                {repo.name}
                              </h4>
                              <p className="text-sm text-gray-400 mt-1">
                                {repo.description || "No description"}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                              {repo.language && (
                                <span className="flex items-center gap-1">
                                  <span className="w-3 h-3 rounded-full bg-cyan-500" />
                                  {repo.language}
                                </span>
                              )}
                              <span className="text-amber-400">★ {repo.stars}</span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <p className="text-gray-400">
                {candidate.github_url
                  ? "GitHub data not available"
                  : "No GitHub profile linked"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
