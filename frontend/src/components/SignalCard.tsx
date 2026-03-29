"use client";

interface SignalCardProps {
  label: string;
  score: number;
  weight: number;
  description?: string;
}

const getScoreColor = (score: number) => {
  // 80+ = Green, 60-79 = Orange, <60 = Red
  if (score >= 80) return "bg-gradient-to-r from-emerald-400 to-emerald-600";
  if (score >= 60) return "bg-gradient-to-r from-orange-400 to-orange-600";
  return "bg-gradient-to-r from-red-400 to-red-600";
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Weak";
};

const getScoreLabelColor = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-orange-400";
  return "text-red-400";
};

export function SignalCard({ label, score, weight, description }: SignalCardProps) {
  return (
    <div className="p-4 bg-[#1a1a2e] rounded-xl border border-white/10 hover:border-white/20 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-white">{label}</h4>
          <p className="text-xs text-gray-500">{weight}% weight</p>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${getScoreLabelColor(score)}`}>{score}</span>
          <p className={`text-xs ${getScoreLabelColor(score)}`}>{getScoreLabel(score)}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${getScoreColor(score)} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      {description && (
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      )}
    </div>
  );
}
