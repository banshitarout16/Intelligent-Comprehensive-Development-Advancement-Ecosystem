import { Box, Typography } from "@mui/material";

const ScoreGauge = ({ score = 0, size = 140, label = "ATS Score" }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  const color = clamped >= 75 ? "#1E8E3E" : clamped >= 50 ? "#FFCC00" : "#D93025";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
      <Box sx={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EAE7DD" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h4" sx={{ color: "text.primary", lineHeight: 1 }}>
            {clamped}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            / 100
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
};

export default ScoreGauge;
