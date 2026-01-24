export function GeometricBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* SVG geometric pattern */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Pattern definition */}
          <pattern
            id="geometric-pattern"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            {/* Hexagon outlines */}
            <polygon
              points="30,5 50,15 50,35 30,45 10,35 10,15"
              fill="none"
              stroke="hsl(0 0% 92%)"
              strokeWidth="1"
            />
            {/* Small diamonds */}
            <polygon
              points="30,20 40,30 30,40 20,30"
              fill="hsl(0 0% 95%)"
              stroke="none"
            />
            {/* Corner triangles */}
            <polygon
              points="0,0 15,0 0,15"
              fill="hsl(0 0% 93%)"
              stroke="none"
            />
            <polygon
              points="60,0 60,15 45,0"
              fill="hsl(0 0% 94%)"
              stroke="none"
            />
            <polygon
              points="0,60 0,45 15,60"
              fill="hsl(0 0% 94%)"
              stroke="none"
            />
            <polygon
              points="60,60 45,60 60,45"
              fill="hsl(0 0% 93%)"
              stroke="none"
            />
            {/* Subtle circles */}
            <circle
              cx="30"
              cy="30"
              r="3"
              fill="hsl(0 0% 90%)"
            />
          </pattern>
          
          {/* Second pattern layer - larger shapes */}
          <pattern
            id="geometric-pattern-large"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            {/* Large subtle triangles */}
            <polygon
              points="60,10 110,100 10,100"
              fill="none"
              stroke="hsl(0 0% 94%)"
              strokeWidth="0.5"
            />
            {/* Connecting lines */}
            <line
              x1="0"
              y1="60"
              x2="120"
              y2="60"
              stroke="hsl(0 0% 95%)"
              strokeWidth="0.5"
              strokeDasharray="4 8"
            />
            <line
              x1="60"
              y1="0"
              x2="60"
              y2="120"
              stroke="hsl(0 0% 95%)"
              strokeWidth="0.5"
              strokeDasharray="4 8"
            />
          </pattern>
        </defs>
        
        {/* Apply patterns */}
        <rect width="100%" height="100%" fill="url(#geometric-pattern)" />
        <rect width="100%" height="100%" fill="url(#geometric-pattern-large)" opacity="0.5" />
      </svg>
    </div>
  );
}
