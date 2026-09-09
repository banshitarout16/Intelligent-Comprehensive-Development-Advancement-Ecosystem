import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, TextField, MenuItem, Slider, Button, Alert, CircularProgress } from "@mui/material";
import { getLanguages, createCodingProblem } from "../api/codingApi.js";

const DIFFICULTY_LABELS = { 1: "Easy", 2: "Basic", 3: "Moderate", 4: "Hard", 5: "Expert" };

const CodingSetup = () => {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState([]);
  const [form, setForm] = useState({ topic: "", difficulty: 3, language: "python" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getLanguages()
      .then(setLanguages)
      .catch(() => setLanguages([{ key: "python", label: "Python" }]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await createCodingProblem(form);
      navigate(`/coding/${session._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't generate a problem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", px: 3, py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Coding Practice
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Get an AI-generated coding problem, write your solution, run it, and get an AI code
        review with complexity analysis.
      </Typography>

      <Paper sx={{ p: 4 }} elevation={1}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Topic"
            placeholder="e.g. arrays, recursion, dynamic programming (leave blank for a random topic)"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            label="Language"
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
          >
            {languages.map((l) => (
              <MenuItem key={l.key} value={l.key}>
                {l.label}
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

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1.5, color: "inherit" }} />
                Generating problem...
              </>
            ) : (
              "Generate problem"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CodingSetup;
