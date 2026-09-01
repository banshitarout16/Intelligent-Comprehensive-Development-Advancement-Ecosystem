import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Chip,
  LinearProgress,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ScoreGauge from "../components/ScoreGauge.jsx";
import { getInterview, submitAnswer, completeInterview } from "../api/interview.js";

const TYPE_LABEL = { mcq: "Multiple choice", technical: "Technical", scenario: "Scenario", hr: "HR" };

const QuestionResult = ({ question }) => (
  <Paper sx={{ p: 3, mt: 2 }} elevation={1}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
      <Chip label={TYPE_LABEL[question.type]} size="small" />
      <Typography variant="h6" sx={{ color: question.score >= 70 ? "success.main" : "text.primary" }}>
        {question.score}/100
      </Typography>
    </Box>
    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1.5 }}>
      {question.prompt}
    </Typography>

    {question.type === "mcq" ? (
      <List dense>
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correctOptionIndex;
          const isSelected = String(i) === question.userAnswer;
          return (
            <ListItem key={i} disableGutters>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {isCorrect ? (
                  <CheckCircleOutlineIcon fontSize="small" sx={{ color: "success.main" }} />
                ) : isSelected ? (
                  <CancelOutlinedIcon fontSize="small" sx={{ color: "error.main" }} />
                ) : null}
              </ListItemIcon>
              <ListItemText
                primary={opt}
                primaryTypographyProps={{ fontWeight: isSelected || isCorrect ? 600 : 400 }}
              />
            </ListItem>
          );
        })}
      </List>
    ) : (
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", mb: 1 }}>
        {question.userAnswer || "(no answer given)"}
      </Typography>
    )}

    <Typography variant="body2" sx={{ mt: 1.5 }}>
      {question.feedback}
    </Typography>

    {question.strengths?.length > 0 && (
      <Box sx={{ mt: 1 }}>
        {question.strengths.map((s, i) => (
          <Chip key={i} label={s} size="small" color="primary" sx={{ mr: 0.5, mb: 0.5 }} />
        ))}
      </Box>
    )}
    {question.improvements?.length > 0 && (
      <Box sx={{ mt: 1 }}>
        {question.improvements.map((s, i) => (
          <Chip key={i} label={s} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
        ))}
      </Box>
    )}
  </Paper>
);

const InterviewSession = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [mcqChoice, setMcqChoice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInterview(id)
      .then((data) => {
        setInterview(data);
        const firstUnanswered = data.questions.findIndex((q) => !q.answeredAt);
        setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
      })
      .catch(() => setError("Couldn't load this interview."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  if (error || !interview) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", px: 3, py: 4 }}>
        <Alert severity="error">{error || "Interview not found."}</Alert>
      </Box>
    );
  }

  if (interview.status === "failed") {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", px: 3, py: 4 }}>
        <Alert severity="error">Question generation failed for this interview. Please start a new one.</Alert>
        <Button component={Link} to="/interview" variant="contained" sx={{ mt: 2 }}>
          Back to setup
        </Button>
      </Box>
    );
  }

  if (interview.status === "completed") {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", px: 3, py: 4 }}>
        <Typography variant="h4" gutterBottom>
          {interview.targetRole} — Interview results
        </Typography>
        <Paper sx={{ p: 4, display: "flex", justifyContent: "center", mb: 3 }} elevation={1}>
          <ScoreGauge score={interview.overallScore} label="Overall score" size={160} />
        </Paper>
        {interview.questions.map((q) => (
          <QuestionResult key={q._id} question={q} />
        ))}
        <Button component={Link} to="/interview" variant="contained" sx={{ mt: 3 }}>
          Start another interview
        </Button>
      </Box>
    );
  }

  const question = interview.questions[currentIndex];
  const isLast = currentIndex === interview.questions.length - 1;
  const answered = Boolean(question.answeredAt);

  const handleSubmitAnswer = async () => {
    setError("");
    const answer = question.type === "mcq" ? mcqChoice : answerText;
    if (answer === "" || answer === null || answer === undefined) {
      setError("Please provide an answer before continuing.");
      return;
    }

    setSubmitting(true);
    try {
      const graded = await submitAnswer(interview._id, question._id, answer);
      const updatedQuestions = [...interview.questions];
      updatedQuestions[currentIndex] = graded;
      setInterview({ ...interview, questions: updatedQuestions });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't grade this answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setAnswerText("");
    setMcqChoice("");
    setCurrentIndex((i) => i + 1);
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      const finished = await completeInterview(interview._id);
      setInterview(finished);
    } catch {
      setError("Couldn't finish the interview. Please try again.");
    } finally {
      setFinishing(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", px: 3, py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="h5">{interview.targetRole}</Typography>
        <Chip label={TYPE_LABEL[question.type]} size="small" />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Question {currentIndex + 1} of {interview.questions.length}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={(currentIndex / interview.questions.length) * 100}
        sx={{ mb: 3 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4 }} elevation={1}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 3 }}>
          {question.prompt}
        </Typography>

        {question.type === "mcq" ? (
          <RadioGroup value={mcqChoice} onChange={(e) => setMcqChoice(e.target.value)}>
            {question.options.map((opt, i) => (
              <FormControlLabel
                key={i}
                value={String(i)}
                control={
                  <Radio disabled={answered} sx={{ color: "primary.main", "&.Mui-checked": { color: "primary.main" } }} />
                }
                label={opt}
              />
            ))}
          </RadioGroup>
        ) : (
          <TextField
            multiline
            minRows={5}
            fullWidth
            placeholder="Type your answer here..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={answered}
          />
        )}

        {!answered ? (
          <Button variant="contained" size="large" sx={{ mt: 3 }} onClick={handleSubmitAnswer} disabled={submitting}>
            {submitting ? "Grading..." : "Submit answer"}
          </Button>
        ) : (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Score: {question.score}/100
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {question.feedback}
            </Typography>
            {isLast ? (
              <Button variant="contained" size="large" onClick={handleFinish} disabled={finishing}>
                {finishing ? "Finishing..." : "Finish interview"}
              </Button>
            ) : (
              <Button variant="contained" size="large" onClick={handleNext}>
                Next question
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default InterviewSession;
