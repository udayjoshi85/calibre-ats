"use client";

interface FlagsListProps {
  greenFlags: string[];
  yellowFlags: string[];
  redFlags: string[];
}

export function FlagsList({ greenFlags, yellowFlags, redFlags }: FlagsListProps) {
  return (
    <div className="space-y-6">
      {/* Green Flags */}
      {greenFlags.length > 0 && (
        <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 p-6">
          <h4 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Green Flags
          </h4>
          <ul className="space-y-2">
            {greenFlags.map((flag, i) => (
              <li
                key={i}
                className="text-sm text-gray-300 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl"
              >
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Yellow Flags */}
      {yellowFlags.length > 0 && (
        <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 p-6">
          <h4 className="text-sm font-medium text-orange-400 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Yellow Flags
          </h4>
          <ul className="space-y-2">
            {yellowFlags.map((flag, i) => (
              <li
                key={i}
                className="text-sm text-gray-300 bg-orange-500/10 border border-orange-500/20 px-4 py-3 rounded-xl"
              >
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 p-6">
          <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Red Flags
          </h4>
          <ul className="space-y-2">
            {redFlags.map((flag, i) => (
              <li
                key={i}
                className="text-sm text-gray-300 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl"
              >
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {greenFlags.length === 0 &&
        yellowFlags.length === 0 &&
        redFlags.length === 0 && (
          <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
            <p className="text-gray-400">No flags extracted</p>
          </div>
        )}
    </div>
  );
}
