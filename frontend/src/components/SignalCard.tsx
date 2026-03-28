"use client";

interface SignalCardProps {
  label: string;
  score: number;
  weight: number;
  description?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Weak";
};

export function SignalCard({ label, score, weight, description }: SignalCardProps) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-gray-900">{label}</h4>
          <p className="text-xs text-gray-500">{weight}% weight</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">{score}</span>
          <p className="text-xs text-gray-500">{getScoreLabel(score)}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${getScoreColor(score)} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      {description && (
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      )}
    </div>
  );
}
