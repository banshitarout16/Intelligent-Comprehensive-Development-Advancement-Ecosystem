import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Grid,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ScoreGauge from "../components/ScoreGauge.jsx";
import ResumeDropzone from "../components/ResumeDropzone.jsx";
import {
  uploadResumeFile,
  analyzeResume,
  listResumes,
  getResume,
  deleteResume,
  resumeFileUrl,
} from "../api/resume.js";
import { useAuth } from "../context/AuthContext.jsx";

const STAGE = {
  IDLE: "idle",
  UPLOADING: "uploading",
  ANALYZING: "analyzing",
  DONE: "done",
  ERROR: "error",
};

const importanceColor = { high: "error", medium: "warning", low: "default" };

const ResumeAnalysis = () => {
  const { isGuest } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [stage, setStage] = useState(STAGE.IDLE);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [loadingList, setLoadingList] = useState(true);

  const refreshList = async () => {
    try {
      const data = await listResumes();
      setResumes(data);
      if (data.length && !activeResume) {
        const latest = data[0];
        if (latest.status === "analyzed") {
          const full = await getResume(latest._id);
          setActiveResume(full);
        }
      }
    } catch {
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (!isGuest) refreshList();
    else setLoadingList(false);
  }, []);

  const handleFileSelected = async (file) => {
    setError("");
    setStage(STAGE.UPLOADING);
    setUploadProgress(0);

    try {
      const uploaded = await uploadResumeFile(file, (evt) => {
        if (evt.total) setUploadProgress(Math.round((evt.loaded * 100) / evt.total));
      });

      setStage(STAGE.ANALYZING);
      const analyzed = await analyzeResume(uploaded._id);
      setActiveResume(analyzed);
      setStage(STAGE.DONE);
      refreshList();
    } catch (err) {
      setStage(STAGE.ERROR);
      setError(err.response?.data?.message || "Something went wrong while processing your resume.");
    }
  };

  const handleSelectPast = async (id) => {
    setError("");
    const full = await getResume(id);
    setActiveResume(full);
    setStage(STAGE.DONE);
  };

  const handleDelete = async (id) => {
    await deleteResume(id);
    if (activeResume?._id === id) setActiveResume(null);
    refreshList();
  };

  if (isGuest) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", px: 3, py: 8, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Create a free account to analyze your resume
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Resume uploads and AI analysis are saved to your account, so guest browsing doesn't
          include this feature.
        </Typography>
        <Button href="/register" variant="contained" size="large">
          Sign Up
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", px: 3, py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Resume & Career Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload your resume as a PDF to get an ATS-style score, extracted skills, role matches,
        and concrete improvement suggestions.
      </Typography>

      {stage !== STAGE.ANALYZING && (
        <ResumeDropzone
          onFileSelected={handleFileSelected}
          uploading={stage === STAGE.UPLOADING}
          progress={uploadProgress}
        />
      )}

      {stage === STAGE.ANALYZING && (
        <Paper sx={{ p: 4, textAlign: "center" }} elevation={1}>
          <CircularProgress sx={{ color: "primary.main", mb: 2 }} />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Analyzing your resume...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This calls the Llama API and usually takes a few seconds.
          </Typography>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {activeResume && activeResume.status === "analyzed" && (
        <Box sx={{ mt: 5 }}>
          <Paper sx={{ p: 4 }} elevation={1}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} sm={4} sx={{ display: "flex", justifyContent: "center" }}>
                <ScoreGauge score={activeResume.atsScore} />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeResume.summary}
                </Typography>

                <Box sx={{ display: "flex", gap: 3, mt: 3, flexWrap: "wrap" }}>
                  {Object.entries(activeResume.scoreBreakdown || {}).map(([key, value]) => (
                    <Box key={key}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                        {key}
                      </Typography>
                      <Typography variant="h6">{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: "100%" }} elevation={1}>
                <Typography variant="h6" gutterBottom>
                  Extracted skills
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {activeResume.extractedSkills?.map((skill) => (
                    <Chip key={skill} label={skill} color="primary" size="small" />
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: "100%" }} elevation={1}>
                <Typography variant="h6" gutterBottom>
                  Strengths
                </Typography>
                <List dense>
                  {activeResume.strengths?.map((s, i) => (
                    <ListItem key={i} disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleOutlineIcon fontSize="small" sx={{ color: "success.main" }} />
                      </ListItemIcon>
                      <ListItemText primary={s} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: "100%" }} elevation={1}>
                <Typography variant="h6" gutterBottom>
                  Role recommendations
                </Typography>
                <List dense>
                  {activeResume.roleRecommendations?.map((r, i) => (
                    <Box key={i} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {r.role}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {r.matchPercent}% match
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {r.reason}
                      </Typography>
                    </Box>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: "100%" }} elevation={1}>
                <Typography variant="h6" gutterBottom>
                  Skill gaps
                </Typography>
                <List dense>
                  {activeResume.skillGaps?.map((g, i) => (
                    <ListItem key={i} disableGutters alignItems="flex-start">
                      <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                        <WarningAmberOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {g.skill}
                            </Typography>
                            <Chip
                              label={g.importance}
                              size="small"
                              color={importanceColor[g.importance] || "default"}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={g.note}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }} elevation={1}>
                <Typography variant="h6" gutterBottom>
                  Improvement suggestions
                </Typography>
                <List dense>
                  {activeResume.improvementSuggestions?.map((s, i) => (
                    <ListItem key={i} disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <LightbulbOutlinedIcon fontSize="small" sx={{ color: "primary.main" }} />
                      </ListItemIcon>
                      <ListItemText primary={s} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {!loadingList && resumes.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Past resumes
          </Typography>
          <List>
            {resumes.map((r) => (
              <ListItem
                key={r._id}
                disableGutters
                sx={{ borderBottom: "1px solid", borderColor: "divider" }}
                secondaryAction={
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Download original file">
                      <IconButton href={resumeFileUrl(r._id)} target="_blank" rel="noopener">
                        <DownloadOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(r._id)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Button sx={{ p: 0, color: "text.primary", fontWeight: 600 }} onClick={() => handleSelectPast(r._id)}>
                      {r.originalFileName}
                    </Button>
                  }
                  secondary={`${r.status} • ${new Date(r.createdAt).toLocaleDateString()}${
                    r.atsScore != null ? ` • Score ${r.atsScore}` : ""
                  }`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default ResumeAnalysis;
