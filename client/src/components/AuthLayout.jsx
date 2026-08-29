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
        sx={{ color: "#14140F", fontWeight: 700, lineHeight: 1.4 }}
      >
        "{quote.text}"
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "rgba(20,20,15,0.6)", mt: 1, fontWeight: 600 }}
      >
        — {quote.author}
      </Typography>
    </Box>
  );
};

const BrandPanel = () => (
  <Box
    sx={{
      height: "100%",
      bgcolor: "primary.main",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      p: 6,
    }}
  >
    <Typography
      variant="overline"
      sx={{
        color: "rgba(20,20,15,0.6)",
        fontWeight: 700,
        letterSpacing: "0.08em",
      }}
    ></Typography>

    <Box sx={{ maxWidth: 380 }}>
      <Typography variant="h3" sx={{ color: "#14140F", mb: 2 }}>
        Your career prep, in one place.
      </Typography>
      <Typography variant="body1" sx={{ color: "rgba(20,20,15,0.75)" }}>
        Resume analysis, AI-driven mock interviews, and coding practice — built
        to get you hired.
      </Typography>
    </Box>

    <RotatingQuote />
  </Box>
);

const AuthLayout = ({ children }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
      minHeight: "calc(100vh - 64px)",
    }}
  >
    <Box sx={{ display: { xs: "none", md: "block" } }}>
      <BrandPanel />
    </Box>
    <Box
      sx={{
        bgcolor: "#14140F",
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
