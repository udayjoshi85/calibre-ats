"use client";

interface SignalCardProps {
  label: string;
  score: number;
  weight: number;
  evidence?: string[];
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

export function SignalCard({ label, score, weight, evidence, description }: SignalCardProps) {
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

      {/* Evidence Section */}
      {evidence && evidence.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Evidence from Resume
          </p>
          <ul className="space-y-1.5">
            {evidence.map((item, index) => (
              <li
                key={index}
                className="text-xs text-gray-300 flex items-start gap-2"
              >
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-orange-400" : "bg-red-400"
                }`} />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No evidence message for low scores */}
      {(!evidence || evidence.length === 0) && score < 40 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-gray-500 italic">No evidence found in resume</p>
        </div>
      )}

      {description && (
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      )}
    </div>
  );
}
