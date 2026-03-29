"use client";

import Link from "next/link";
import type { Candidate } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  analyzing: "bg-blue-100 text-blue-700",
  reviewed: "bg-purple-100 text-purple-700",
  shortlisted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const scoreColors = (score: number | null) => {
  if (score === null) return "bg-gray-100 text-gray-600";
  if (score >= 80) return "bg-green-100 text-green-700";
  if (score >= 65) return "bg-blue-100 text-blue-700";
  if (score >= 45) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

const getRecommendationLabel = (score: number | null) => {
  if (score === null) return "Pending";
  if (score >= 80) return "Strong Yes";
  if (score >= 65) return "Yes";
  if (score >= 45) return "Maybe";
  return "No";
};

export function CandidateCard({
  candidate,
  onStatusChange,
  onDelete,
}: CandidateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {/* Score Badge */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${scoreColors(
                candidate.overall_score
              )}`}
            >
              {candidate.overall_score ?? "?"}
            </div>
            <div>
              <CardTitle className="text-base">{candidate.name}</CardTitle>
              <p className="text-sm text-gray-500">
                {getRecommendationLabel(candidate.overall_score)}
              </p>
            </div>
          </div>
          <Badge className={statusColors[candidate.status]}>
            {candidate.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Contact Info */}
        <div className="text-sm text-gray-600 space-y-1 mb-4">
          {candidate.email && <p>{candidate.email}</p>}
          {candidate.phone && <p>{candidate.phone}</p>}
        </div>

        {/* Profile Links */}
        <div className="flex flex-wrap gap-2 mb-4">
          {candidate.linkedin_url && (
            <a
              href={candidate.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            >
              LinkedIn
            </a>
          )}
          {candidate.github_url && (
            <a
              href={candidate.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              GitHub
            </a>
          )}
          {candidate.portfolio_url && (
            <a
              href={candidate.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100"
            >
              Portfolio
            </a>
          )}
          {candidate.notion_url && (
            <a
              href={candidate.notion_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 bg-orange-50 text-orange-600 rounded hover:bg-orange-100"
            >
              Notion
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 hover:bg-green-50"
              onClick={() => onStatusChange(candidate.id, "shortlisted")}
              disabled={candidate.status === "shortlisted"}
            >
              Shortlist
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => onStatusChange(candidate.id, "rejected")}
              disabled={candidate.status === "rejected"}
            >
              Reject
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href={`/candidates/${candidate.id}`} />}>
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
                >
                  Download Resume
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(candidate.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
