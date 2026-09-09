import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import CodeEditor from "../components/CodeEditor.jsx";
import { getCodingSession, runCode, submitCode } from "../api/codingApi.js";

const CORRECTNESS_COLOR = { correct: "success", partially_correct: "warning", incorrect: "error", unknown: "default" };

const CodingPractice = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    getCodingSession(id)
      .then((s) => {
        setSession(s);
        setCode(s.starterCode || "");
      })
      .catch(() => setError("Couldn't load this problem."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  if (error || !session) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", px: 3, py: 4 }}>
        <Alert severity="error">{error || "Problem not found."}</Alert>
      </Box>
    );
  }

  if (session.status === "failed") {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", px: 3, py: 4 }}>
        <Alert severity="error">Problem generation failed for this session. Please start a new one.</Alert>
        <Button component={Link} to="/coding" variant="contained" sx={{ mt: 2 }}>
          Back to setup
        </Button>
      </Box>
    );
  }

  const handleRun = async () => {
    setError("");
    setRunning(true);
    setRunResult(null);
    try {
      const result = await runCode(session._id, code);
      setRunResult(result);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't run this code. Please try again.");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const data = await submitCode(session._id, code);
      setSession(data.session);
      setRunResult({ stdout: data.submission.stdout, stderr: data.submission.stderr });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't submit this code for review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const latestSubmission = session.submissions?.[session.submissions.length - 1];

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: 3, py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4">{session.title}</Typography>
        <Chip label={`Difficulty ${session.difficulty}`} size="small" />
      </Box>

      <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
          {session.problemStatement}
        </Typography>

        {session.examples?.map((ex, i) => (
          <Box key={i} sx={{ mb: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Example {i + 1}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Input: {ex.input}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Output: {ex.output}
            </Typography>
            {ex.explanation && (
              <Typography variant="body2" color="text.secondary">
                {ex.explanation}
              </Typography>
            )}
          </Box>
        ))}

        {session.constraints?.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Constraints
            </Typography>
            <List dense>
              {session.constraints.map((c, i) => (
                <ListItem key={i} disableGutters sx={{ py: 0 }}>
                  <ListItemText primary={c} primaryTypographyProps={{ variant: "body2", color: "text.secondary" }} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {session.hints?.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {hintsShown < session.hints.length && (
              <Button size="small" variant="outlined" onClick={() => setHintsShown((h) => h + 1)}>
                Show hint {hintsShown + 1} of {session.hints.length}
              </Button>
            )}
            {session.hints.slice(0, hintsShown).map((h, i) => (
              <Alert key={i} severity="info" sx={{ mt: 1 }}>
                {h}
              </Alert>
            ))}
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <CodeEditor value={code} onChange={setCode} />

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={handleRun} disabled={running}>
          {running ? "Running..." : "Run code"}
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit for review"}
        </Button>
      </Box>

      {runResult && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: "#14140F" }} elevation={1}>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
            Output
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#FFFFFF", fontFamily: "monospace", whiteSpace: "pre-wrap", mt: 0.5 }}
          >
            {runResult.stdout || "(no output)"}
          </Typography>
          {runResult.stderr && (
            <Typography
              variant="body2"
              sx={{ color: "#FFB4AD", fontFamily: "monospace", whiteSpace: "pre-wrap", mt: 1 }}
            >
              {runResult.stderr}
            </Typography>
          )}
        </Paper>
      )}

      {latestSubmission && (
        <Paper sx={{ p: 3, mt: 3 }} elevation={1}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Review</Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Chip
                label={latestSubmission.correctness.replace("_", " ")}
                color={CORRECTNESS_COLOR[latestSubmission.correctness]}
                size="small"
              />
              <Typography variant="h6">{latestSubmission.score}/100</Typography>
            </Box>
          </Box>

          {latestSubmission.issues?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Issues
              </Typography>
              {latestSubmission.issues.map((it, i) => (
                <Typography key={i} variant="body2" color="text.secondary">
                  • {it}
                </Typography>
              ))}
            </Box>
          )}

          {latestSubmission.suggestions?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Suggestions
              </Typography>
              {latestSubmission.suggestions.map((s, i) => (
                <Typography key={i} variant="body2" color="text.secondary">
                  • {s}
                </Typography>
              ))}
            </Box>
          )}

          {latestSubmission.complexityExplanation && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Complexity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {latestSubmission.complexityExplanation}
              </Typography>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default CodingPractice;
