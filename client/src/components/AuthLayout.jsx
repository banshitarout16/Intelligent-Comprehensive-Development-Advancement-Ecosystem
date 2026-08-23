import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
const QUOTES = [
  {
    text: "Success is where preparation and opportunity meet.",
    author: "Bobby Unser",
  },
  {
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes",
  },
  {
    text: "Opportunities don't happen, you create them.",
    author: "Chris Grosser",
  },
  {
    text: "Do the hard jobs first. The easy jobs will take care of themselves.",
    author: "Dale Carnegie",
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
];

const RotatingQuote = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      const timeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % QUOTES.length);
        setVisible(true);
      }, 400);
      return () => clearTimeout(timeout);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const quote = QUOTES[index];

  return (
    <Box
      sx={{
        minHeight: 90,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <Typography
        variant="h6"
        sx={{ color: "#FFFFFF", fontWeight: 600, lineHeight: 1.4 }}
      >
        "{quote.text}"
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "rgba(255,255,255,0.55)", mt: 1 }}
      >
        — {quote.author}
      </Typography>
    </Box>
  );
};

const WavePanel = () => (
  <Box
    sx={{
      position: "relative",
      height: "100%",
      overflow: "hidden",
      bgcolor: "text.primary", // ink
    }}
  >
    <svg
      viewBox="0 0 500 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <pattern
          id="linePattern"
          width="26"
          height="26"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="26"
            x2="26"
            y2="0"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        </pattern>
        <radialGradient id="glow" cx="30%" cy="15%" r="60%">
          <stop offset="0%" stopColor="#FFCC00" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFCC00" stopOpacity="0" />
        </radialGradient>
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <filter id="softBlur">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      <rect width="500" height="900" fill="#14140F" />
      <rect width="500" height="900" fill="url(#glow)" />

      <g filter="url(#softBlur)" opacity="0.7">
        <path
          d="M0 0 H180 C260 120 100 220 190 340 C270 440 90 560 200 680 C270 760 120 840 190 900 H0 Z"
          fill="#1F1F1A"
        />
      </g>
      <path
        d="M0 0 H180 C260 120 100 220 190 340 C270 440 90 560 200 680 C270 760 120 840 190 900 H0 Z"
        fill="#1F1F1A"
      />
      <path
        d="M0 60 H120 C190 160 60 260 140 380 C210 480 50 600 150 720 C210 800 80 860 140 900 H0 Z"
        fill="#FFCC00"
        opacity="0.9"
      />
      <path
        d="M0 140 H70 C120 220 40 300 90 400 C130 480 30 600 90 700 C120 780 50 840 80 900 H0 Z"
        fill="#14140F"
        opacity="0.55"
      />

      <rect width="500" height="900" fill="url(#linePattern)" />
      <line
        x1="220"
        y1="0"
        x2="220"
        y2="900"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />
      <line
        x1="320"
        y1="0"
        x2="320"
        y2="900"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="1"
      />
      <line
        x1="420"
        y1="0"
        x2="420"
        y2="900"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="1"
      />

      <rect width="500" height="900" filter="url(#grain)" opacity="0.05" />
    </svg>

    <Box
      sx={{
        position: "relative",
        zIndex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 5,
      }}
    >
      <RotatingQuote />

      <Box sx={{ maxWidth: 320 }}>
        <Typography variant="h4" sx={{ color: "#FFFFFF", mb: 1.5 }}>
          Your career prep, in one place.
        </Typography>
        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)" }}>
          Resume analysis, AI-driven mock interviews, and coding practice —
          built to get you hired.
        </Typography>
      </Box>
    </Box>
  </Box>
);

const AuthLayout = ({ children }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", md: "minmax(0, 4fr) minmax(0, 8fr)" },
      minHeight: "calc(100vh - 64px)",
    }}
  >
    <Box sx={{ display: { xs: "none", md: "block" } }}>
      <WavePanel />
    </Box>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        py: 8,
      }}
    >
      {children}
    </Box>
  </Box>
);

export default AuthLayout;
