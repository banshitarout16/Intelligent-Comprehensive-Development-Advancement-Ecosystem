import { Box, Typography } from "@mui/material";
import RotatingQuote from "./RotatingQuote.jsx";

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
    />

    <Box sx={{ maxWidth: 380 }}>
      <Typography variant="h3" sx={{ color: "#14140F", mb: 2 }}>
        Your career prep, in one place.
      </Typography>
      <Typography variant="body1" sx={{ color: "rgba(20,20,15,0.75)" }}>
        Resume analysis, AI-driven mock interviews, and coding practice — built
        to get you hired.
      </Typography>
    </Box>

    <RotatingQuote variant="dark" />
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
