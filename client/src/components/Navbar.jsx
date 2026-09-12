import {
  Typography,
  Button,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/resume", label: "Resume" },
  { to: "/interview", label: "Interview" },
  { to: "/chat", label: "Ask AI" },
  { to: "/coding", label: "Coding" },
];

const NavLink = ({ to, label }) => {
  const location = useLocation();
  const isActive =
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Button
      component={Link}
      to={to}
      sx={{
        color: isActive ? "primary.dark" : "text.primary",
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 2,
          left: "20%",
          right: "20%",
          height: 2,
          borderRadius: 1,
          bgcolor: isActive ? "primary.main" : "transparent",
        },
      }}
    >
      {label}
    </Button>
  );
};

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
    <Box sx={{ px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: "20px",
          boxShadow: "0 2px 10px rgba(20,20,15,0.06)",
          px: { xs: 2, md: 3 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
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
              width: 22,
              height: 22,
              borderRadius: "7px",
              bgcolor: "primary.main",
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            <Box component="span" sx={{ color: "text.primary" }}>
              Prep
            </Box>
            <Box component="span" sx={{ color: "primary.dark" }}>
              Verse
            </Box>
          </Typography>
        </Box>

        {user ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              flexWrap: "wrap",
            }}
          >
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} {...link} />
            ))}
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
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  navigate("/interviews");
                }}
              >
                Interview History
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  navigate("/coding-history");
                }}
              >
                Coding History
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
      </Box>
    </Box>
  );
};

export default Navbar;
