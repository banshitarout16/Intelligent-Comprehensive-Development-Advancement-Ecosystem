import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, isGuest, logout, continueAsGuest, exitGuest } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleContinueAsGuest = () => {
    continueAsGuest();
    navigate("/dashboard");
  };

  const handleExitGuest = () => {
    exitGuest();
    navigate("/login");
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box
          component={Link}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "3px",
              bgcolor: "primary.main",
            }}
          />
          <Typography
            variant="h6"
            sx={{ color: "text.primary", fontWeight: 800 }}
          >
            PrepVerse
          </Typography>
        </Box>

        {user ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              component={Link}
              to="/dashboard"
              sx={{ color: "text.primary" }}
            >
              Dashboard
            </Button>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  navigate("/profile");
                }}
              >
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : isGuest ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Browsing as guest
            </Typography>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              color="primary"
            >
              Sign Up
            </Button>
            <Button onClick={handleExitGuest} sx={{ color: "text.primary" }}>
              Exit
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              onClick={handleContinueAsGuest}
              sx={{ color: "text.secondary" }}
            >
              Continue without login
            </Button>
            <Button component={Link} to="/login" sx={{ color: "text.primary" }}>
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              color="primary"
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
