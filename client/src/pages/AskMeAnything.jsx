import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  CircularProgress,
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import { sendChatMessage, listConversations, getConversation } from "../api/chatApi.js";
import { useAuth } from "../context/AuthContext.jsx";

const MessageBubble = ({ role, content }) => (
  <Box sx={{ display: "flex", justifyContent: role === "user" ? "flex-end" : "flex-start", mb: 1.5 }}>
    <Box
      sx={{
        maxWidth: "80%",
        px: 2,
        py: 1.2,
        borderRadius: 2,
        bgcolor: role === "user" ? "primary.main" : "background.paper",
        color: role === "user" ? "text.primary" : "text.primary",
        border: role === "user" ? "none" : "1px solid",
        borderColor: "divider",
        whiteSpace: "pre-wrap",
      }}
    >
      <Typography variant="body2">{content}</Typography>
    </Box>
  </Box>
);

const AskMeAnything = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingActive, setLoadingActive] = useState(Boolean(id));
  const scrollRef = useRef(null);

  const refreshList = () => {
    if (isGuest) return;
    listConversations()
      .then(setConversations)
      .catch(() => {});
  };

  useEffect(() => {
    refreshList();
  }, []);

  useEffect(() => {
    if (!id) {
      setActive(null);
      return;
    }
    setLoadingActive(true);
    getConversation(id)
      .then(setActive)
      .catch(() => setActive(null))
      .finally(() => setLoadingActive(false));
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages?.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const messageText = input.trim();
    setInput("");
    setSending(true);

    const optimistic = active
      ? { ...active, messages: [...active.messages, { role: "user", content: messageText }] }
      : { _id: null, title: "New conversation", messages: [{ role: "user", content: messageText }] };
    setActive(optimistic);

    try {
      const updated = await sendChatMessage(active?._id, messageText);
      setActive(updated);
      if (!active?._id) navigate(`/chat/${updated._id}`, { replace: true });
      refreshList();
    } catch {
      setActive((prev) => ({
        ...prev,
        messages: [...prev.messages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }],
      }));
    } finally {
      setSending(false);
    }
  };

  if (isGuest) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", px: 3, py: 8, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Create a free account to use the AI assistant
        </Typography>
        <Button href="/register" variant="contained" size="large">
          Sign Up
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "260px 1fr" }, height: "calc(100vh - 64px)" }}>
      <Box sx={{ borderRight: { md: "1px solid" }, borderColor: "divider", p: 2, overflowY: "auto" }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => navigate("/chat")}
          sx={{ mb: 2 }}
        >
          New chat
        </Button>
        <List dense>
          {conversations.map((c) => (
            <ListItemButton
              key={c._id}
              selected={c._id === id}
              onClick={() => navigate(`/chat/${c._id}`)}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemText primary={c.title} primaryTypographyProps={{ noWrap: true, fontSize: 14 }} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
          {!active && !loadingActive && (
            <Box sx={{ textAlign: "center", mt: 8 }}>
              <Typography variant="h5" gutterBottom>
                Ask me anything
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Career questions, interview explanations, or feedback on a previous answer.
              </Typography>
            </Box>
          )}

          {loadingActive && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
              <CircularProgress sx={{ color: "primary.main" }} />
            </Box>
          )}

          {active?.messages?.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}
          <div ref={scrollRef} />
        </Box>

        <Divider />
        <Box component="form" onSubmit={handleSend} sx={{ p: 2, display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Ask a career or interview question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
          />
          <IconButton type="submit" disabled={sending || !input.trim()} sx={{ color: "primary.main" }}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default AskMeAnything;
