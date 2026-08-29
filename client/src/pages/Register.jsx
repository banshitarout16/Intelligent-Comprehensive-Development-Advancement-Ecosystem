import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Link as MLink,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../context/AuthContext.jsx";
import AuthLayout from "../components/AuthLayout.jsx";

const darkFieldSx = {
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#FFCC00" },
  "& .MuiOutlinedInput-root": {
    color: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.04)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.24)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
    "&.Mui-focused fieldset": { borderColor: "#FFCC00", borderWidth: 2 },
  },
  "& .MuiInputAdornment-root .MuiSvgIcon-root": {
    color: "rgba(255,255,255,0.5)",
  },
  "& input:-webkit-autofill": {
    WebkitTextFillColor: "#FFFFFF",
    WebkitBoxShadow: "0 0 0 1000px #1F1F1A inset",
    caretColor: "#FFFFFF",
  },
  "& .MuiFormHelperText-root": { color: "rgba(255,255,255,0.45)" },
};

const Register = () => {
  const { register, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <Box sx={{ width: "100%", maxWidth: 400 }}>
        <Typography variant="h3" sx={{ color: "#FFFFFF", mb: 4 }}>
          Sign up
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              bgcolor: "rgba(217,48,37,0.12)",
              color: "#FFB4AD",
              border: "1px solid rgba(217,48,37,0.35)",
            }}
          >
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <TextField
            label="Full name"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={darkFieldSx}
            required
          />
          <TextField
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="johndoe@gmail.com"
            value={form.email}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={darkFieldSx}
            required
          />
          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            helperText="At least 6 characters"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    sx={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={darkFieldSx}
            required
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </Box>

        <Typography
          variant="body2"
          sx={{ mt: 2.5, color: "rgba(255,255,255,0.6)" }}
        >
          Already have an account?{" "}
          <MLink component={Link} to="/login" sx={{ color: "#FFCC00" }}>
            Log in
          </MLink>
        </Typography>

        <Divider
          sx={{
            my: 3,
            borderColor: "rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Or
        </Divider>

        <Button
          onClick={handleGuest}
          variant="outlined"
          color="inherit"
          fullWidth
          size="large"
          sx={{
            borderColor: "rgba(255,255,255,0.3)",
            color: "#FFFFFF",
            "&:hover": {
              borderColor: "#FFFFFF",
              backgroundColor: "rgba(255,255,255,0.06)",
            },
          }}
        >
          Continue without login
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default Register;
