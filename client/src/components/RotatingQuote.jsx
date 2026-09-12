import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const QUOTES = [
  { text: "Success is where preparation and opportunity meet.", author: "Bobby Unser" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Opportunities don't happen, you create them.", author: "Chris Grosser" },
  { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
];

const VARIANTS = {
  dark: { text: "#14140F", author: "rgba(20,20,15,0.6)" },
  light: { text: "text.primary", author: "text.secondary" },
};

const RotatingQuote = ({ variant = "dark", align = "left" }) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const colors = VARIANTS[variant] || VARIANTS.dark;

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
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <Typography variant="h6" sx={{ color: colors.text, fontWeight: 700, lineHeight: 1.4, maxWidth: 520 }}>
        "{quote.text}"
      </Typography>
      <Typography variant="body2" sx={{ color: colors.author, mt: 1, fontWeight: 600 }}>
        — {quote.author}
      </Typography>
    </Box>
  );
};

export default RotatingQuote;
