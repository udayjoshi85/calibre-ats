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
  strong_yes: "bg-green-100 text-green-800 border-green-200",
  yes: "bg-blue-100 text-blue-800 border-blue-200",
  maybe: "bg-yellow-100 text-yellow-800 border-yellow-200",
  no: "bg-red-100 text-red-800 border-red-200",
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
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || "Candidate not found"}</p>
        <Link href="/jobs">
          <Button variant="outline">Back to Jobs</Button>
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
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          &larr; Back to Candidates
        </Link>

        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {/* Score Circle */}
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                candidate.overall_score !== null
                  ? candidate.overall_score >= 80
                    ? "bg-green-100 text-green-700"
                    : candidate.overall_score >= 65
                    ? "bg-blue-100 text-blue-700"
                    : candidate.overall_score >= 45
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {candidate.overall_score ?? "?"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {candidate.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {analysis && (
                  <Badge
                    className={`${
                      recommendationStyles[analysis.recommendation]
                    } border`}
                  >
                    {recommendationLabels[analysis.recommendation]}
                  </Badge>
                )}
                <Badge variant="outline">{candidate.status}</Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-green-600"
              onClick={() => handleStatusChange("shortlisted")}
              disabled={candidate.status === "shortlisted"}
            >
              Shortlist
            </Button>
            <Button
              variant="outline"
              className="text-red-600"
              onClick={() => handleStatusChange("rejected")}
              disabled={candidate.status === "rejected"}
            >
              Reject
            </Button>
          </div>
        </div>

        {/* Contact & Links */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          {candidate.email && <span>{candidate.email}</span>}
          {candidate.phone && <span>{candidate.phone}</span>}
          {candidate.resume_url && (
            <a
              href={candidate.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Download Resume
            </a>
          )}
        </div>

        {/* Profile Links */}
        <div className="mt-3 flex flex-wrap gap-2">
          {candidate.linkedin_url && (
            <a
              href={candidate.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100"
            >
              LinkedIn
            </a>
          )}
          {candidate.github_url && (
            <a
              href={candidate.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
            >
              GitHub
            </a>
          )}
          {candidate.portfolio_url && (
            <a
              href={candidate.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm hover:bg-purple-100"
            >
              Portfolio
            </a>
          )}
        </div>
      </div>

      {/* Summary */}
      {analysis?.summary && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">AI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{analysis.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="signals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="signals">Signal Breakdown</TabsTrigger>
          <TabsTrigger value="flags">Flags</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="github">GitHub</TabsTrigger>
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
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Analysis not available</p>
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
            <p className="text-gray-500 italic">Analysis not available</p>
          )}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          {analysis ? (
            <div className="space-y-6">
              {/* Matched Skills */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
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
                              ? "bg-green-100 text-green-700"
                              : score >= 40
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {skill} ({score}%)
                        </Badge>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No skills matched
                  </p>
                )}
              </div>

              {/* Missing Skills */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Missing Skills
                </h3>
                {analysis.skills_missing && analysis.skills_missing.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills_missing.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="border-red-200 text-red-700"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No missing skills identified
                  </p>
                )}
              </div>

              {/* Experience */}
              {analysis.experience_years !== null && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Experience</h3>
                  <p className="text-gray-700">
                    {analysis.experience_years} years
                  </p>
                </div>
              )}

              {/* Certifications */}
              {analysis.certifications && analysis.certifications.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Certifications
                  </h3>
                  <ul className="space-y-1">
                    {analysis.certifications.map((cert, i) => (
                      <li key={i} className="text-sm text-gray-700">
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
                  <h3 className="font-medium text-gray-900 mb-2">Education</h3>
                  <ul className="space-y-1">
                    {analysis.education.map((edu, i) => (
                      <li key={i} className="text-sm text-gray-700">
                        {edu.degree} - {edu.institution}
                        {edu.year && ` (${edu.year})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">Analysis not available</p>
          )}
        </TabsContent>

        {/* GitHub Tab */}
        <TabsContent value="github">
          {candidate.github_data && !candidate.github_data.error ? (
            <div className="space-y-6">
              {/* Overview */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {candidate.github_data.public_repos}
                    </div>
                    <div className="text-sm text-gray-500">Repositories</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {candidate.github_data.total_stars}
                    </div>
                    <div className="text-sm text-gray-500">Total Stars</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {candidate.github_data.followers}
                    </div>
                    <div className="text-sm text-gray-500">Followers</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {candidate.github_data.activity_score}
                    </div>
                    <div className="text-sm text-gray-500">Activity Score</div>
                  </CardContent>
                </Card>
              </div>

              {/* Languages */}
              {candidate.github_data.languages && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(candidate.github_data.languages).map(
                      ([lang, count]) => (
                        <Badge key={lang} variant="secondary">
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
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Top Repositories
                    </h3>
                    <div className="space-y-3">
                      {candidate.github_data.top_repos.map((repo) => (
                        <a
                          key={repo.name}
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {repo.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {repo.description || "No description"}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              {repo.language && (
                                <span className="flex items-center gap-1">
                                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                                  {repo.language}
                                </span>
                              )}
                              <span>★ {repo.stars}</span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              {candidate.github_url
                ? "GitHub data not available"
                : "No GitHub profile linked"}
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
