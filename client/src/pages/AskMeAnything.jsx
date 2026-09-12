import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  sendChatMessage,
  listConversations,
  getConversation,
} from "../api/chatApi.js";
import { useAuth } from "../context/AuthContext.jsx";

const SIDEBAR_WIDTH = 280;
const SIDEBAR_WIDTH_COLLAPSED = 76;

const MessageBubble = ({ role, content }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: role === "user" ? "flex-end" : "flex-start",
      mb: 1.5,
    }}
  >
    <Box
      sx={{
        maxWidth: "80%",
        px: 2,
        py: 1.2,
        borderRadius: 3,
        bgcolor: role === "user" ? "primary.main" : "background.paper",
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
  const [collapsed, setCollapsed] = useState(false);
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
      ? {
          ...active,
          messages: [
            ...active.messages,
            { role: "user", content: messageText },
          ],
        }
      : {
          _id: null,
          title: "New conversation",
          messages: [{ role: "user", content: messageText }],
        };
    setActive(optimistic);

    try {
      const updated = await sendChatMessage(active?._id, messageText);
      setActive(updated);
      if (!active?._id) navigate(`/chat/${updated._id}`, { replace: true });
      refreshList();
    } catch {
      setActive((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
          },
        ],
      }));
    } finally {
      setSending(false);
    }
  };

  if (isGuest) {
    return (
      <Box
        sx={{ maxWidth: 700, mx: "auto", px: 3, py: 8, textAlign: "center" }}
      >
        <Typography variant="h5" gutterBottom>
          Create a free account to use the AI assistant
        </Typography>
        <Box
          component="a"
          href="/register"
          sx={{
            display: "inline-block",
            mt: 2,
            px: 3,
            py: 1.2,
            borderRadius: "12px",
            bgcolor: "primary.main",
            color: "text.primary",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Sign Up
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        pt: { xs: 1, md: 1.5 },
        pb: { xs: 2, md: 4 },
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: `${collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}px 1fr`,
        },
        gap: 2,
        height: "calc(100vh - 120px)",
        transition: "grid-template-columns 0.2s ease",
      }}
    >
      <Paper
        elevation={1}
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          p: collapsed ? 1.5 : 2,
          overflow: "hidden",
          transition: "padding 0.2s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: collapsed ? "center" : "flex-end",
            mb: 1,
          }}
        >
          <IconButton size="small" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? (
              <ChevronRightIcon fontSize="small" />
            ) : (
              <ChevronLeftIcon fontSize="small" />
            )}
          </IconButton>
        </Box>

        <Tooltip title={collapsed ? "New chat" : ""} placement="right">
          <Box
            onClick={() => navigate("/chat")}
            sx={{
              bgcolor: "primary.main",
              color: "text.primary",
              borderRadius: "14px",
              py: 1.2,
              px: collapsed ? 0 : 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              cursor: "pointer",
              fontWeight: 700,
              mb: 2,
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            <AddIcon fontSize="small" />
            {!collapsed && (
              <Typography sx={{ fontWeight: 700 }}>New chat</Typography>
            )}
          </Box>
        </Tooltip>

        {!collapsed && (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontWeight: 700, pl: 1, mb: 0.5 }}
          >
            RECENT
          </Typography>
        )}

        <List sx={{ overflowY: "auto", flex: 1 }}>
          {conversations.map((c) => (
            <Tooltip
              key={c._id}
              title={collapsed ? c.title : ""}
              placement="right"
            >
              <ListItemButton
                selected={c._id === id}
                onClick={() => navigate(`/chat/${c._id}`)}
                sx={{
                  borderRadius: "12px",
                  mb: 0.5,
                  justifyContent: collapsed ? "center" : "flex-start",
                  px: collapsed ? 1 : 1.5,
                  bgcolor:
                    c._id === id ? "rgba(255,204,0,0.16)" : "transparent",
                  "&:hover": { bgcolor: "rgba(255,204,0,0.1)" },
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36 }}>
                  <ChatBubbleOutlineIcon fontSize="small" />
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={c.title}
                    primaryTypographyProps={{ noWrap: true, fontSize: 14 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Paper>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minWidth: 0,
        }}
      >
        <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 0, md: 2 }, py: 2 }}>
          {!active && !loadingActive && (
            <Box sx={{ textAlign: "center", mt: { xs: 4, md: 10 } }}>
              <Box
                sx={{ position: "relative", display: "inline-block", mb: 3 }}
              >
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,204,0,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChatBubbleOutlineIcon
                    sx={{ fontSize: 40, color: "text.primary" }}
                  />
                </Box>
                <AutoAwesomeIcon
                  sx={{
                    position: "absolute",
                    top: -6,
                    right: -10,
                    color: "primary.main",
                    fontSize: 26,
                  }}
                />
              </Box>
              <Typography variant="h4" gutterBottom>
                Ask me anything
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Career questions, interview explanations, or feedback on a
                previous answer.
              </Typography>
            </Box>
          )}

          {active?.messages?.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}
          <div ref={scrollRef} />
        </Box>

        <Paper
          component="form"
          onSubmit={handleSend}
          elevation={1}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderRadius: "999px",
            px: 2,
            py: 0.5,
          }}
        >
          <IconButton size="small" disabled sx={{ color: "text.secondary" }}>
            <AttachFileIcon fontSize="small" />
          </IconButton>
          <TextField
            fullWidth
            variant="standard"
            placeholder="Ask a career or interview question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            InputProps={{ disableUnderline: true }}
          />
          <IconButton
            type="submit"
            disabled={sending || !input.trim()}
            sx={{
              bgcolor: "primary.main",
              color: "text.primary",
              "&:hover": { bgcolor: "primary.dark" },
              "&.Mui-disabled": { bgcolor: "rgba(255,204,0,0.4)" },
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  );
};

export default AskMeAnything;
