import { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, Card, CardContent, Avatar, Button, Alert } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getLatestResume } from "../api/resume.js";
import { listInterviews } from "../api/interview.js";
import { listCodingSessions } from "../api/codingApi.js";

const StatCard = ({ title, value, to }) => {
  const content = (
    <Card sx={{ height: "100%", position: "relative", overflow: "hidden" }} elevation={1}>
      <Box sx={{ position: "absolute", top: 0, left: 0, width: 6, height: "100%", bgcolor: "primary.main" }} />
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

  if (!to) return content;
  return (
    <Box component={Link} to={to} sx={{ textDecoration: "none", display: "block", height: "100%" }}>
      {content}
    </Box>
  );
};

const Dashboard = () => {
  const { user, isGuest } = useAuth();
  const [latestResume, setLatestResume] = useState(null);
  const [loadingResume, setLoadingResume] = useState(!isGuest);
  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(!isGuest);
  const [codingSessions, setCodingSessions] = useState([]);
  const [loadingCoding, setLoadingCoding] = useState(!isGuest);

  useEffect(() => {
    if (isGuest) return;
    getLatestResume()
      .then(setLatestResume)
      .catch(() => setLatestResume(null))
      .finally(() => setLoadingResume(false));
    listInterviews()
      .then(setInterviews)
      .catch(() => setInterviews([]))
      .finally(() => setLoadingInterviews(false));
    listCodingSessions()
      .then(setCodingSessions)
      .catch(() => setCodingSessions([]))
      .finally(() => setLoadingCoding(false));
  }, [isGuest]);

  const resumeScoreValue = () => {
    if (isGuest) return "—";
    if (loadingResume) return "…";
    if (!latestResume || latestResume.status !== "analyzed") return "—";
    return latestResume.atsScore;
  };

  const completedInterviews = interviews.filter((i) => i.status === "completed");

  const interviewsCompletedValue = () => {
    if (isGuest) return "—";
    if (loadingInterviews) return "…";
    return completedInterviews.length;
  };

  const avgInterviewScoreValue = () => {
    if (isGuest || loadingInterviews) return null;
    if (completedInterviews.length === 0) return null;
    return Math.round(
      completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / completedInterviews.length
    );
  };

  const avgScore = avgInterviewScoreValue();

  const solvedProblems = codingSessions.filter((s) => s.status === "solved");
  const codingSolvedValue = () => {
    if (isGuest) return "—";
    if (loadingCoding) return "…";
    return solvedProblems.length;
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: 3, py: 4 }}>
      {isGuest && (
        <Alert
          severity="warning"
          icon={false}
          sx={{ mb: 3, bgcolor: "#FFF7D6", border: "1px solid #EAE7DD", color: "text.primary" }}
          action={
            <Button component={Link} to="/register" variant="contained" color="primary" size="small">
              Sign Up
            </Button>
          }
        >
          You're exploring PrepVerse as a guest — create a free account to save your progress.
        </Alert>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main", fontSize: 24 }}>
          {isGuest ? "G" : user?.name?.[0]?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h4">
            {isGuest ? "Welcome, guest" : `Welcome back, ${user?.name?.split(" ")[0]}`}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's an overview of your career prep journey.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Resume Score" value={resumeScoreValue()} to="/resume" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title={avgScore !== null ? "Interviews Completed (avg score)" : "Interviews Completed"}
            value={avgScore !== null ? `${interviewsCompletedValue()} (${avgScore})` : interviewsCompletedValue()}
            to="/interviews"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Coding Problems Solved" value={codingSolvedValue()} to="/coding-history" />
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }} elevation={1}>
        <Typography variant="h6" gutterBottom>
          Getting started
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload your resume for an AI-driven ATS score, start a mock interview personalized to
          your target role, practice a coding problem with instant AI review, or ask the AI
          assistant a career question.
        </Typography>
        {!isGuest && (
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button component={Link} to="/resume" variant="contained">
              {latestResume ? "View resume analysis" : "Analyze your resume"}
            </Button>
            <Button component={Link} to="/interview" variant="outlined">
              Start a mock interview
            </Button>
            <Button component={Link} to="/coding" variant="outlined">
              Practice a coding problem
            </Button>
            <Button component={Link} to="/chat" variant="outlined">
              Ask AI a question
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;
