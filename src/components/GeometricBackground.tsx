export function GeometricBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Light mode - minimal animated pattern */}
      <svg
        className="absolute inset-0 h-full w-full dark:hidden"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle dot grid */}
          <pattern
            id="dots-light"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="30" cy="30" r="1.5" fill="hsl(215 20% 75%)" />
          </pattern>

          {/* Single large circle - animated */}
          <radialGradient id="glow-light" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(215 20% 80%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(215 20% 80%)" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Dot pattern */}
        <rect width="100%" height="100%" fill="url(#dots-light)" />
        
        {/* Floating circles - subtle animation */}
        <g className="animate-[float_20s_ease-in-out_infinite]">
          <circle cx="20%" cy="30%" r="200" fill="url(#glow-light)" />
        </g>
        <g className="animate-[float_25s_ease-in-out_infinite_reverse]">
          <circle cx="80%" cy="70%" r="250" fill="url(#glow-light)" />
        </g>
        <g className="animate-[float_30s_ease-in-out_infinite]" style={{ animationDelay: '-10s' }}>
          <circle cx="50%" cy="50%" r="180" fill="url(#glow-light)" />
        </g>
      </svg>

      {/* Dark mode - minimal animated pattern */}
      <svg
        className="absolute inset-0 h-full w-full hidden dark:block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle dot grid */}
          <pattern
            id="dots-dark"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="30" cy="30" r="1.5" fill="hsl(215 16% 30%)" />
          </pattern>

          {/* Single large circle - animated */}
          <radialGradient id="glow-dark" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(215 16% 25%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(215 16% 25%)" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Dot pattern */}
        <rect width="100%" height="100%" fill="url(#dots-dark)" />
        
        {/* Floating circles - subtle animation */}
        <g className="animate-[float_20s_ease-in-out_infinite]">
          <circle cx="20%" cy="30%" r="200" fill="url(#glow-dark)" />
        </g>
        <g className="animate-[float_25s_ease-in-out_infinite_reverse]">
          <circle cx="80%" cy="70%" r="250" fill="url(#glow-dark)" />
        </g>
        <g className="animate-[float_30s_ease-in-out_infinite]" style={{ animationDelay: '-10s' }}>
          <circle cx="50%" cy="50%" r="180" fill="url(#glow-dark)" />
        </g>
      </svg>
    </div>
  );
}
