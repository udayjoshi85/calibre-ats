"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 32, text: "text-xl", tagline: "text-[8px]" },
  md: { icon: 40, text: "text-2xl", tagline: "text-[10px]" },
  lg: { icon: 56, text: "text-3xl", tagline: "text-xs" },
  xl: { icon: 72, text: "text-4xl", tagline: "text-sm" },
};

export function Logo({ size = "md", showTagline = true, className = "" }: LogoProps) {
  const s = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon - Interlocking Arrows */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          {/* Cyan gradient for top-right arrow */}
          <linearGradient id="cyanGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
          {/* Gold gradient for bottom-left arrow */}
          <linearGradient id="goldGradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4a574" />
            <stop offset="50%" stopColor="#c9a227" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>
        </defs>

        {/* Top-right arrow (cyan) */}
        <path
          d="M32 4L52 16V28L44 24V36L32 44L20 36V24L32 32L44 24V16L32 8L20 16V20L12 16V12L32 4Z"
          fill="url(#cyanGradient)"
        />
        <path
          d="M52 16L60 12V24L52 28V16Z"
          fill="url(#cyanGradient)"
        />

        {/* Bottom-left arrow (gold) */}
        <path
          d="M32 60L12 48V36L20 40V28L32 20L44 28V40L32 32L20 40V48L32 56L44 48V44L52 48V52L32 60Z"
          fill="url(#goldGradient)"
        />
        <path
          d="M12 48L4 52V40L12 36V48Z"
          fill="url(#goldGradient)"
        />
      </svg>

      {/* Text */}
      <div className="flex flex-col">
        <div className={`font-bold tracking-tight ${s.text} flex items-baseline`}>
          {/* CA with gold accent */}
          <span className="relative">
            <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">C</span>
            <span className="relative">
              <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">A</span>
              {/* Gold ring accent on A */}
              <svg
                className="absolute -right-1 top-1/2 -translate-y-1/2"
                width={size === "xl" ? "14" : size === "lg" ? "11" : size === "md" ? "9" : "7"}
                height={size === "xl" ? "14" : size === "lg" ? "11" : size === "md" ? "9" : "7"}
                viewBox="0 0 14 14"
              >
                <circle cx="7" cy="7" r="5" stroke="url(#goldGradient)" strokeWidth="2" fill="none" />
              </svg>
            </span>
          </span>
          {/* LIBRE in white/light */}
          <span className="text-white ml-0.5">LIBRE</span>
        </div>

        {/* Tagline */}
        {showTagline && (
          <span className={`${s.tagline} text-gray-400 tracking-wider font-medium mt-0.5`}>
            Unlocking Human Potential. Defined.
          </span>
        )}
      </div>
    </div>
  );
}

// Compact version for header/navbar
export function LogoCompact({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon */}
      <svg
        width={36}
        height={36}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="cyanGradientCompact" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
          <linearGradient id="goldGradientCompact" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4a574" />
            <stop offset="50%" stopColor="#c9a227" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>
        </defs>

        {/* Top-right arrow (cyan) */}
        <path
          d="M32 4L52 16V28L44 24V36L32 44L20 36V24L32 32L44 24V16L32 8L20 16V20L12 16V12L32 4Z"
          fill="url(#cyanGradientCompact)"
        />
        <path
          d="M52 16L60 12V24L52 28V16Z"
          fill="url(#cyanGradientCompact)"
        />

        {/* Bottom-left arrow (gold) */}
        <path
          d="M32 60L12 48V36L20 40V28L32 20L44 28V40L32 32L20 40V48L32 56L44 48V44L52 48V52L32 60Z"
          fill="url(#goldGradientCompact)"
        />
        <path
          d="M12 48L4 52V40L12 36V48Z"
          fill="url(#goldGradientCompact)"
        />
      </svg>

      {/* Text */}
      <div className="font-bold text-xl tracking-tight flex items-baseline">
        <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">CA</span>
        <span className="text-white">LIBRE</span>
      </div>
    </div>
  );
}
