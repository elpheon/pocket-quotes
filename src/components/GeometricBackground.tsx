export function GeometricBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Futuristic minimalist SVG pattern */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Grid pattern */}
          <pattern
            id="grid-pattern"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* Horizontal lines */}
            <line
              x1="0"
              y1="40"
              x2="80"
              y2="40"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted/30"
            />
            {/* Vertical lines */}
            <line
              x1="40"
              y1="0"
              x2="40"
              y2="80"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted/30"
            />
            {/* Corner dots */}
            <circle cx="0" cy="0" r="2" fill="currentColor" className="text-muted/20" />
            <circle cx="80" cy="0" r="2" fill="currentColor" className="text-muted/20" />
            <circle cx="0" cy="80" r="2" fill="currentColor" className="text-muted/20" />
            <circle cx="80" cy="80" r="2" fill="currentColor" className="text-muted/20" />
            {/* Center intersection */}
            <circle cx="40" cy="40" r="3" fill="currentColor" className="text-muted/15" />
          </pattern>

          {/* Hexagon accent pattern */}
          <pattern
            id="hex-pattern"
            x="0"
            y="0"
            width="200"
            height="173"
            patternUnits="userSpaceOnUse"
          >
            <polygon
              points="100,10 170,50 170,120 100,160 30,120 30,50"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-muted/15"
            />
          </pattern>

          {/* Diagonal lines for depth */}
          <pattern
            id="diagonal-pattern"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="20"
              x2="40"
              y2="20"
              stroke="currentColor"
              strokeWidth="0.3"
              className="text-muted/10"
            />
          </pattern>

          {/* Large geometric shapes */}
          <pattern
            id="large-shapes"
            x="0"
            y="0"
            width="400"
            height="400"
            patternUnits="userSpaceOnUse"
          >
            {/* Large circle outline */}
            <circle
              cx="200"
              cy="200"
              r="150"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted/10"
            />
            {/* Inner circle */}
            <circle
              cx="200"
              cy="200"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted/8"
            />
            {/* Cross lines through center */}
            <line
              x1="50"
              y1="200"
              x2="350"
              y2="200"
              stroke="currentColor"
              strokeWidth="0.3"
              className="text-muted/8"
            />
            <line
              x1="200"
              y1="50"
              x2="200"
              y2="350"
              stroke="currentColor"
              strokeWidth="0.3"
              className="text-muted/8"
            />
            {/* Corner triangles */}
            <polygon
              points="0,0 60,0 0,60"
              fill="currentColor"
              className="text-muted/5"
            />
            <polygon
              points="400,0 340,0 400,60"
              fill="currentColor"
              className="text-muted/5"
            />
            <polygon
              points="0,400 60,400 0,340"
              fill="currentColor"
              className="text-muted/5"
            />
            <polygon
              points="400,400 340,400 400,340"
              fill="currentColor"
              className="text-muted/5"
            />
          </pattern>
        </defs>
        
        {/* Layer the patterns */}
        <rect width="100%" height="100%" fill="url(#diagonal-pattern)" />
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        <rect width="100%" height="100%" fill="url(#hex-pattern)" opacity="0.6" />
        <rect width="100%" height="100%" fill="url(#large-shapes)" opacity="0.8" />
      </svg>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-transparent to-background/40" />
    </div>
  );
}
