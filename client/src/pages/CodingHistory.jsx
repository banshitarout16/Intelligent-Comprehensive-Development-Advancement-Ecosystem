import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip, Button, IconButton, Tooltip } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { listCodingSessions, deleteCodingSession } from "../api/codingApi.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_COLOR = { solved: "success", ready: "default", generating: "warning", failed: "error" };

const CodingHistory = () => {
  const { isGuest } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    listCodingSessions()
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isGuest) {
      setLoading(false);
      return;
    }
    refresh();
  }, [isGuest]);

  const handleDelete = async (id) => {
    await deleteCodingSession(id);
    refresh();
  };

  if (isGuest) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", px: 3, py: 8, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Create a free account to track coding practice history
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
        <Typography variant="h4">Coding Practice History</Typography>
        <Button component={Link} to="/coding" variant="contained">
          New problem
        </Button>
      </Box>

      {!loading && sessions.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center" }} elevation={1}>
          <Typography variant="body1" color="text.secondary">
            You haven't attempted any coding problems yet.
          </Typography>
        </Paper>
      )}

      <List>
        {sessions.map((s) => (
          <Paper key={s._id} sx={{ mb: 2 }} elevation={1}>
            <ListItem
              secondaryAction={
                <Tooltip title="Delete">
                  <IconButton onClick={() => handleDelete(s._id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemText
                primary={
                  <Button component={Link} to={`/coding/${s._id}`} sx={{ p: 0, color: "text.primary", fontWeight: 600 }}>
                    {s.title}
                  </Button>
                }
                secondary={`${s.language} • difficulty ${s.difficulty} • ${new Date(s.createdAt).toLocaleDateString()}`}
              />
              <Chip label={s.status} color={STATUS_COLOR[s.status] || "default"} size="small" sx={{ mr: 6 }} />
            </ListItem>
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default CodingHistory;
