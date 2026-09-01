import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip, Button, IconButton, Tooltip } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { listInterviews, deleteInterview } from "../api/interview.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_COLOR = { completed: "success", in_progress: "warning", failed: "error" };

const InterviewHistory = () => {
  const { isGuest } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    listInterviews()
      .then(setInterviews)
      .catch(() => setInterviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isGuest) {
      setLoading(false);
      return;
    }
    refresh();
  }, []);

  const handleDelete = async (id) => {
    await deleteInterview(id);
    refresh();
  };

  if (isGuest) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", px: 3, py: 8, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Create a free account to track interview history
        </Typography>
        <Button href="/register" variant="contained" size="large">
          Sign Up
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", px: 3, py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Interview History</Typography>
        <Button component={Link} to="/interview" variant="contained">
          New interview
        </Button>
      </Box>

      {!loading && interviews.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center" }} elevation={1}>
          <Typography variant="body1" color="text.secondary">
            You haven't taken any mock interviews yet.
          </Typography>
        </Paper>
      )}

      <List>
        {interviews.map((it) => (
          <Paper key={it._id} sx={{ mb: 2 }} elevation={1}>
            <ListItem
              secondaryAction={
                <Tooltip title="Delete">
                  <IconButton onClick={() => handleDelete(it._id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemText
                primary={
                  <Button component={Link} to={`/interview/${it._id}`} sx={{ p: 0, color: "text.primary", fontWeight: 600 }}>
                    {it.targetRole}
                  </Button>
                }
                secondary={`${it.interviewType} • difficulty ${it.difficulty} • ${new Date(it.createdAt).toLocaleDateString()}`}
              />
              <Chip
                label={it.status === "completed" ? `${it.overallScore}/100` : it.status}
                color={STATUS_COLOR[it.status] || "default"}
                size="small"
                sx={{ mr: 6 }}
              />
            </ListItem>
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default InterviewHistory;
