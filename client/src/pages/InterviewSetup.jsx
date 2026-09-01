import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Slider,
  Button,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../context/AuthContext.jsx";
import { createInterview } from "../api/interview.js";
import { getLatestResume } from "../api/resume.js";

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry level" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

const INTERVIEW_TYPES = [
  { value: "mixed", label: "Mixed" },
  { value: "mcq", label: "Multiple choice" },
  { value: "technical", label: "Technical" },
  { value: "scenario", label: "Scenario-based" },
  { value: "hr", label: "HR / behavioral" },
];

const DIFFICULTY_LABELS = { 1: "Easy", 2: "Basic", 3: "Moderate", 4: "Hard", 5: "Expert" };

const InterviewSetup = () => {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const [latestResume, setLatestResume] = useState(null);
  const [useResume, setUseResume] = useState(false);
  const [form, setForm] = useState({
    targetRole: "",
    experienceLevel: "mid",
    skills: "",
    interviewType: "mixed",
    difficulty: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isGuest) return;
    getLatestResume()
      .then((r) => {
        if (r && r.status === "analyzed") setLatestResume(r);
      })
      .catch(() => {});
  }, [isGuest]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.targetRole.trim()) {
      setError("Please enter a target role.");
      return;
    }

    setLoading(true);
    try {
      const skills = form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const interview = await createInterview({
        targetRole: form.targetRole.trim(),
        experienceLevel: form.experienceLevel,
        skills,
        interviewType: form.interviewType,
        difficulty: form.difficulty,
        resumeId: useResume && latestResume ? latestResume._id : undefined,
      });

      navigate(`/interview/${interview._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't generate interview questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", px: 3, py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Interview Preparation
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure a mock interview and get AI-generated questions with instant feedback on your
        answers.
      </Typography>

      <Paper sx={{ p: 4 }} elevation={1}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Target role"
            placeholder="e.g. Frontend Developer, Data Analyst"
            value={form.targetRole}
            onChange={handleChange("targetRole")}
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            select
            label="Experience level"
            value={form.experienceLevel}
            onChange={handleChange("experienceLevel")}
          >
            {EXPERIENCE_LEVELS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Skills"
            placeholder="e.g. React, Node.js, SQL"
            helperText="Comma-separated"
            value={form.skills}
            onChange={handleChange("skills")}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            label="Interview type"
            value={form.interviewType}
            onChange={handleChange("interviewType")}
          >
            {INTERVIEW_TYPES.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Difficulty: {DIFFICULTY_LABELS[form.difficulty]}
            </Typography>
            <Slider
              value={form.difficulty}
              onChange={(e, val) => setForm({ ...form, difficulty: val })}
              step={1}
              marks
              min={1}
              max={5}
              sx={{ color: "primary.main" }}
            />
          </Box>

          {!isGuest && latestResume && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={useResume}
                  onChange={(e) => setUseResume(e.target.checked)}
                  sx={{ color: "primary.main", "&.Mui-checked": { color: "primary.main" } }}
                />
              }
              label={`Personalize questions using my resume (${latestResume.originalFileName})`}
            />
          )}

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1.5, color: "inherit" }} />
                Generating questions...
              </>
            ) : (
              "Start interview"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default InterviewSetup;
