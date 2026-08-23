import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const StatCard = ({ title, value }) => (
  <Card
    sx={{ height: "100%", position: "relative", overflow: "hidden" }}
    elevation={1}
  >
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 6,
        height: "100%",
        bgcolor: "primary.main",
      }}
    />
    <CardContent sx={{ pl: 3.5 }}>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h4" sx={{ color: "text.primary", mt: 1 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user, isGuest } = useAuth();

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: 3, py: 4 }}>
      {isGuest && (
        <Alert
          severity="warning"
          icon={false}
          sx={{
            mb: 3,
            bgcolor: "#FFF7D6",
            border: "1px solid #EAE7DD",
            color: "text.primary",
          }}
          action={
            <Button
              component={Link}
              to="/register"
              variant="contained"
              color="primary"
              size="small"
            >
              Sign Up
            </Button>
          }
        >
          You're exploring PrepVerse as a guest — create a free account to save
          your progress.
        </Alert>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Avatar
          sx={{ width: 56, height: 56, bgcolor: "primary.main", fontSize: 24 }}
        >
          {isGuest ? "G" : user?.name?.[0]?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h4">
            {isGuest
              ? "Welcome, guest"
              : `Welcome back, ${user?.name?.split(" ")[0]}`}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's an overview of your career prep journey.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Resume Score" value="—" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Interviews Completed" value="0" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Coding Problems Solved" value="0" />
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }} elevation={1}>
        <Typography variant="h6" gutterBottom>
          Getting started
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Resume analysis, interview prep, and coding practice modules will
          appear here as they're built in upcoming branches
          (feature/resume-analysis, feature/interview-prep,
          feature/ai-assistant-coding).
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;
