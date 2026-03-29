"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Candidate } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CandidateCardProps {
  candidate: Candidate;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-white/10", text: "text-gray-300", dot: "bg-gray-400" },
  analyzing: { bg: "bg-cyan-500/20", text: "text-cyan-400", dot: "bg-cyan-400" },
  reviewed: { bg: "bg-purple-500/20", text: "text-purple-400", dot: "bg-purple-400" },
  shortlisted: { bg: "bg-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
  rejected: { bg: "bg-red-500/20", text: "text-red-400", dot: "bg-red-400" },
};

const getScoreConfig = (score: number | null) => {
  if (score === null) return { bg: "bg-white/10", text: "text-gray-400", ring: "ring-white/10", label: "Pending" };
  // 80+ = Green (Strong Yes)
  if (score >= 80) return { bg: "bg-gradient-to-br from-emerald-400 to-emerald-600", text: "text-white", ring: "ring-emerald-500/30", label: "Strong Yes" };
  // 60-79 = Orange (Maybe)
  if (score >= 60) return { bg: "bg-gradient-to-br from-orange-400 to-orange-600", text: "text-white", ring: "ring-orange-500/30", label: "Maybe" };
  // Below 60 = Red (No)
  return { bg: "bg-gradient-to-br from-red-400 to-red-600", text: "text-white", ring: "ring-red-500/30", label: "No" };
};

export function CandidateCard({
  candidate,
  onStatusChange,
  onDelete,
}: CandidateCardProps) {
  const router = useRouter();
  const scoreConfig = getScoreConfig(candidate.overall_score);
  const status = statusConfig[candidate.status] || statusConfig.pending;

  const handleCardClick = () => {
    router.push(`/candidates/${candidate.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-[#1a1a2e] rounded-2xl border border-white/10 p-5 cursor-pointer hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
    >
      {/* Decorative gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Score Badge */}
            <div className={`w-14 h-14 rounded-2xl ${scoreConfig.bg} ${scoreConfig.text} flex items-center justify-center font-bold text-xl shadow-lg ring-4 ${scoreConfig.ring} score-badge`}>
              {candidate.overall_score ?? "?"}
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                {candidate.name}
              </h3>
              <p className="text-sm text-gray-400 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
                {scoreConfig.label}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <Badge className={`${status.bg} ${status.text} border-0 font-medium capitalize`}>
            {candidate.status}
          </Badge>
        </div>

        {/* Contact Info */}
        <div className="text-sm text-gray-400 space-y-1.5 mb-4">
          {candidate.email && (
            <p className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {candidate.email}
            </p>
          )}
          {candidate.phone && (
            <p className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {candidate.phone}
            </p>
          )}
        </div>

        {/* Profile Links */}
        <div className="flex flex-wrap gap-2 mb-4">
          {candidate.linkedin_url && (
            <a
              href={candidate.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors font-medium border border-blue-500/20"
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
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/10 text-gray-300 rounded-full hover:bg-white/20 transition-colors font-medium border border-white/10"
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
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full hover:bg-purple-500/30 transition-colors font-medium border border-purple-500/20"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Portfolio
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(candidate.id, "shortlisted");
              }}
              disabled={candidate.status === "shortlisted"}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Shortlist
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(candidate.id, "rejected");
              }}
              disabled={candidate.status === "rejected"}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="sm" className="rounded-xl hover:bg-white/10" />}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10">
              <DropdownMenuItem render={<Link href={`/candidates/${candidate.id}`} />} className="text-gray-300 hover:text-white hover:bg-white/10">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </DropdownMenuItem>
              {candidate.resume_url && (
                <DropdownMenuItem
                  render={
                    <a
                      href={candidate.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                  className="text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Resume
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => onDelete(candidate.id)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
