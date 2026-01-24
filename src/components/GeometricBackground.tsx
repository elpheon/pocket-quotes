export function GeometricBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Light mode - minimal geometric lines */}
      <svg
        className="absolute inset-0 h-full w-full dark:hidden"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Triangle grid pattern */}
          <pattern
            id="triangles-light"
            x="0"
            y="0"
            width="100"
            height="87"
            patternUnits="userSpaceOnUse"
          >
            {/* Triangle pointing up */}
            <path
              d="M50 0 L100 87 L0 87 Z"
              fill="none"
              stroke="hsl(215 20% 80%)"
              strokeWidth="0.5"
            />
            {/* Connecting lines */}
            <line x1="25" y1="43.5" x2="75" y2="43.5" stroke="hsl(215 20% 85%)" strokeWidth="0.3" />
          </pattern>
        </defs>
        
        {/* Base triangle pattern */}
        <rect width="100%" height="100%" fill="url(#triangles-light)" />
        
        {/* Animated floating geometric shapes */}
        <g className="animate-[float_25s_ease-in-out_infinite]" opacity="0.4">
          {/* Large triangle */}
          <path
            d="M200 100 L350 350 L50 350 Z"
            fill="none"
            stroke="hsl(215 20% 70%)"
            strokeWidth="1"
          />
        </g>
        
        <g className="animate-[float_30s_ease-in-out_infinite_reverse]" opacity="0.3">
          {/* Hexagon */}
          <path
            d="M850 200 L920 240 L920 320 L850 360 L780 320 L780 240 Z"
            fill="none"
            stroke="hsl(215 20% 75%)"
            strokeWidth="1"
          />
        </g>
        
        <g className="animate-[float_20s_ease-in-out_infinite]" style={{ animationDelay: '-8s' }} opacity="0.35">
          {/* Diamond */}
          <path
            d="M500 450 L600 550 L500 650 L400 550 Z"
            fill="none"
            stroke="hsl(215 20% 72%)"
            strokeWidth="1"
          />
        </g>

        <g className="animate-[float_35s_ease-in-out_infinite]" style={{ animationDelay: '-15s' }} opacity="0.25">
          {/* Large square rotated */}
          <path
            d="M1100 300 L1250 450 L1100 600 L950 450 Z"
            fill="none"
            stroke="hsl(215 20% 78%)"
            strokeWidth="0.8"
          />
        </g>
      </svg>

      {/* Dark mode - minimal geometric lines */}
      <svg
        className="absolute inset-0 h-full w-full hidden dark:block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Triangle grid pattern */}
          <pattern
            id="triangles-dark"
            x="0"
            y="0"
            width="100"
            height="87"
            patternUnits="userSpaceOnUse"
          >
            {/* Triangle pointing up */}
            <path
              d="M50 0 L100 87 L0 87 Z"
              fill="none"
              stroke="hsl(215 16% 25%)"
              strokeWidth="0.5"
            />
            {/* Connecting lines */}
            <line x1="25" y1="43.5" x2="75" y2="43.5" stroke="hsl(215 16% 22%)" strokeWidth="0.3" />
          </pattern>
        </defs>
        
        {/* Base triangle pattern */}
        <rect width="100%" height="100%" fill="url(#triangles-dark)" />
        
        {/* Animated floating geometric shapes */}
        <g className="animate-[float_25s_ease-in-out_infinite]" opacity="0.5">
          {/* Large triangle */}
          <path
            d="M200 100 L350 350 L50 350 Z"
            fill="none"
            stroke="hsl(215 16% 35%)"
            strokeWidth="1"
          />
        </g>
        
        <g className="animate-[float_30s_ease-in-out_infinite_reverse]" opacity="0.4">
          {/* Hexagon */}
          <path
            d="M850 200 L920 240 L920 320 L850 360 L780 320 L780 240 Z"
            fill="none"
            stroke="hsl(215 16% 32%)"
            strokeWidth="1"
          />
        </g>
        
        <g className="animate-[float_20s_ease-in-out_infinite]" style={{ animationDelay: '-8s' }} opacity="0.45">
          {/* Diamond */}
          <path
            d="M500 450 L600 550 L500 650 L400 550 Z"
            fill="none"
            stroke="hsl(215 16% 33%)"
            strokeWidth="1"
          />
        </g>

        <g className="animate-[float_35s_ease-in-out_infinite]" style={{ animationDelay: '-15s' }} opacity="0.35">
          {/* Large square rotated */}
          <path
            d="M1100 300 L1250 450 L1100 600 L950 450 Z"
            fill="none"
            stroke="hsl(215 16% 30%)"
            strokeWidth="0.8"
          />
        </g>
      </svg>
    </div>
  );
}
