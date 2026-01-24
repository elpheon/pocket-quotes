export function GeometricBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Light mode - diagonal square grid */}
      <svg
        className="absolute inset-0 h-full w-full dark:hidden"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Diagonal square/diamond grid pattern */}
          <pattern
            id="diamonds-light"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect
              x="0"
              y="0"
              width="60"
              height="60"
              fill="none"
              stroke="hsl(215 20% 82%)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        
        {/* Base diamond grid pattern */}
        <rect width="100%" height="100%" fill="url(#diamonds-light)" />
        
        {/* Animated floating diamond shapes - more prominent */}
        <g className="animate-[float_25s_ease-in-out_infinite]" opacity="0.55">
          <rect
            x="100"
            y="150"
            width="120"
            height="120"
            fill="none"
            stroke="hsl(215 20% 65%)"
            strokeWidth="1.5"
            transform="rotate(45 160 210)"
          />
        </g>
        
        <g className="animate-[float_30s_ease-in-out_infinite_reverse]" opacity="0.5">
          <rect
            x="750"
            y="100"
            width="150"
            height="150"
            fill="none"
            stroke="hsl(215 20% 68%)"
            strokeWidth="1.5"
            transform="rotate(45 825 175)"
          />
        </g>
        
        <g className="animate-[float_20s_ease-in-out_infinite]" style={{ animationDelay: '-8s' }} opacity="0.6">
          <rect
            x="400"
            y="400"
            width="100"
            height="100"
            fill="none"
            stroke="hsl(215 20% 62%)"
            strokeWidth="1.5"
            transform="rotate(45 450 450)"
          />
        </g>

        <g className="animate-[float_35s_ease-in-out_infinite]" style={{ animationDelay: '-15s' }} opacity="0.45">
          <rect
            x="950"
            y="350"
            width="180"
            height="180"
            fill="none"
            stroke="hsl(215 20% 70%)"
            strokeWidth="1.2"
            transform="rotate(45 1040 440)"
          />
        </g>

        <g className="animate-[float_28s_ease-in-out_infinite]" style={{ animationDelay: '-5s' }} opacity="0.5">
          <rect
            x="200"
            y="500"
            width="80"
            height="80"
            fill="none"
            stroke="hsl(215 20% 66%)"
            strokeWidth="1.2"
            transform="rotate(45 240 540)"
          />
        </g>
      </svg>

      {/* Dark mode - diagonal square grid */}
      <svg
        className="absolute inset-0 h-full w-full hidden dark:block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Diagonal square/diamond grid pattern */}
          <pattern
            id="diamonds-dark"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect
              x="0"
              y="0"
              width="60"
              height="60"
              fill="none"
              stroke="hsl(215 16% 24%)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        
        {/* Base diamond grid pattern */}
        <rect width="100%" height="100%" fill="url(#diamonds-dark)" />
        
        {/* Animated floating diamond shapes - more prominent */}
        <g className="animate-[float_25s_ease-in-out_infinite]" opacity="0.65">
          <rect
            x="100"
            y="150"
            width="120"
            height="120"
            fill="none"
            stroke="hsl(215 16% 42%)"
            strokeWidth="1.5"
            transform="rotate(45 160 210)"
          />
        </g>
        
        <g className="animate-[float_30s_ease-in-out_infinite_reverse]" opacity="0.6">
          <rect
            x="750"
            y="100"
            width="150"
            height="150"
            fill="none"
            stroke="hsl(215 16% 40%)"
            strokeWidth="1.5"
            transform="rotate(45 825 175)"
          />
        </g>
        
        <g className="animate-[float_20s_ease-in-out_infinite]" style={{ animationDelay: '-8s' }} opacity="0.7">
          <rect
            x="400"
            y="400"
            width="100"
            height="100"
            fill="none"
            stroke="hsl(215 16% 44%)"
            strokeWidth="1.5"
            transform="rotate(45 450 450)"
          />
        </g>

        <g className="animate-[float_35s_ease-in-out_infinite]" style={{ animationDelay: '-15s' }} opacity="0.55">
          <rect
            x="950"
            y="350"
            width="180"
            height="180"
            fill="none"
            stroke="hsl(215 16% 38%)"
            strokeWidth="1.2"
            transform="rotate(45 1040 440)"
          />
        </g>

        <g className="animate-[float_28s_ease-in-out_infinite]" style={{ animationDelay: '-5s' }} opacity="0.6">
          <rect
            x="200"
            y="500"
            width="80"
            height="80"
            fill="none"
            stroke="hsl(215 16% 41%)"
            strokeWidth="1.2"
            transform="rotate(45 240 540)"
          />
        </g>
      </svg>
    </div>
  );
}
