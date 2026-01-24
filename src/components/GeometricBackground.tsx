export function GeometricBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base background that respects theme */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Light mode pattern */}
      <svg
        className="absolute inset-0 h-full w-full dark:hidden"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Fine grid pattern - light mode */}
          <pattern
            id="fine-grid-light"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="40" stroke="hsl(212 26% 75%)" strokeWidth="1" />
            <line x1="0" y1="0" x2="40" y2="0" stroke="hsl(212 26% 75%)" strokeWidth="1" />
          </pattern>

          {/* Large grid pattern - light mode */}
          <pattern
            id="large-grid-light"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="120" stroke="hsl(215 20% 65%)" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="120" y2="0" stroke="hsl(215 20% 65%)" strokeWidth="1.5" />
            {/* Intersection dots */}
            <circle cx="0" cy="0" r="4" fill="hsl(215 20% 60%)" />
          </pattern>

          {/* Hexagon pattern - light mode */}
          <pattern
            id="hex-light"
            x="0"
            y="0"
            width="180"
            height="156"
            patternUnits="userSpaceOnUse"
          >
            <polygon
              points="90,8 158,45 158,111 90,148 22,111 22,45"
              fill="none"
              stroke="hsl(215 20% 70%)"
              strokeWidth="1.5"
            />
            {/* Center dot in hexagon */}
            <circle cx="90" cy="78" r="5" fill="hsl(215 20% 75% / 0.6)" />
          </pattern>

          {/* Corner triangles - light mode */}
          <pattern
            id="corners-light"
            x="0"
            y="0"
            width="300"
            height="300"
            patternUnits="userSpaceOnUse"
          >
            <polygon points="0,0 80,0 0,80" fill="hsl(215 20% 80% / 0.4)" />
            <polygon points="300,0 220,0 300,80" fill="hsl(215 20% 80% / 0.4)" />
            <polygon points="0,300 80,300 0,220" fill="hsl(215 20% 80% / 0.4)" />
            <polygon points="300,300 220,300 300,220" fill="hsl(215 20% 80% / 0.4)" />
            {/* Diagonal accent lines */}
            <line x1="0" y1="150" x2="300" y2="150" stroke="hsl(215 20% 75%)" strokeWidth="0.5" strokeDasharray="8 12" />
            <line x1="150" y1="0" x2="150" y2="300" stroke="hsl(215 20% 75%)" strokeWidth="0.5" strokeDasharray="8 12" />
          </pattern>

          {/* Large circles - light mode */}
          <pattern
            id="circles-light"
            x="0"
            y="0"
            width="500"
            height="500"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="250" cy="250" r="200" fill="none" stroke="hsl(215 20% 75%)" strokeWidth="1" />
            <circle cx="250" cy="250" r="120" fill="none" stroke="hsl(215 20% 78%)" strokeWidth="1" />
            <circle cx="250" cy="250" r="50" fill="none" stroke="hsl(215 20% 80%)" strokeWidth="1" />
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#fine-grid-light)" />
        <rect width="100%" height="100%" fill="url(#large-grid-light)" />
        <rect width="100%" height="100%" fill="url(#hex-light)" opacity="0.7" />
        <rect width="100%" height="100%" fill="url(#corners-light)" />
        <rect width="100%" height="100%" fill="url(#circles-light)" opacity="0.5" />
      </svg>

      {/* Dark mode pattern */}
      <svg
        className="absolute inset-0 h-full w-full hidden dark:block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Fine grid pattern - dark mode */}
          <pattern
            id="fine-grid-dark"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="40" stroke="hsl(215 19% 28%)" strokeWidth="1" />
            <line x1="0" y1="0" x2="40" y2="0" stroke="hsl(215 19% 28%)" strokeWidth="1" />
          </pattern>

          {/* Large grid pattern - dark mode */}
          <pattern
            id="large-grid-dark"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="120" stroke="hsl(215 19% 32%)" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="120" y2="0" stroke="hsl(215 19% 32%)" strokeWidth="1.5" />
            {/* Intersection dots */}
            <circle cx="0" cy="0" r="4" fill="hsl(215 16% 40%)" />
          </pattern>

          {/* Hexagon pattern - dark mode */}
          <pattern
            id="hex-dark"
            x="0"
            y="0"
            width="180"
            height="156"
            patternUnits="userSpaceOnUse"
          >
            <polygon
              points="90,8 158,45 158,111 90,148 22,111 22,45"
              fill="none"
              stroke="hsl(215 19% 35%)"
              strokeWidth="1.5"
            />
            {/* Center dot in hexagon */}
            <circle cx="90" cy="78" r="5" fill="hsl(215 16% 40% / 0.6)" />
          </pattern>

          {/* Corner triangles - dark mode */}
          <pattern
            id="corners-dark"
            x="0"
            y="0"
            width="300"
            height="300"
            patternUnits="userSpaceOnUse"
          >
            <polygon points="0,0 80,0 0,80" fill="hsl(215 16% 25% / 0.5)" />
            <polygon points="300,0 220,0 300,80" fill="hsl(215 16% 25% / 0.5)" />
            <polygon points="0,300 80,300 0,220" fill="hsl(215 16% 25% / 0.5)" />
            <polygon points="300,300 220,300 300,220" fill="hsl(215 16% 25% / 0.5)" />
            {/* Diagonal accent lines */}
            <line x1="0" y1="150" x2="300" y2="150" stroke="hsl(215 16% 35%)" strokeWidth="0.5" strokeDasharray="8 12" />
            <line x1="150" y1="0" x2="150" y2="300" stroke="hsl(215 16% 35%)" strokeWidth="0.5" strokeDasharray="8 12" />
          </pattern>

          {/* Large circles - dark mode */}
          <pattern
            id="circles-dark"
            x="0"
            y="0"
            width="500"
            height="500"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="250" cy="250" r="200" fill="none" stroke="hsl(215 16% 35%)" strokeWidth="1" />
            <circle cx="250" cy="250" r="120" fill="none" stroke="hsl(215 16% 32%)" strokeWidth="1" />
            <circle cx="250" cy="250" r="50" fill="none" stroke="hsl(215 16% 30%)" strokeWidth="1" />
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#fine-grid-dark)" />
        <rect width="100%" height="100%" fill="url(#large-grid-dark)" />
        <rect width="100%" height="100%" fill="url(#hex-dark)" opacity="0.7" />
        <rect width="100%" height="100%" fill="url(#corners-dark)" />
        <rect width="100%" height="100%" fill="url(#circles-dark)" opacity="0.5" />
      </svg>
    </div>
  );
}
