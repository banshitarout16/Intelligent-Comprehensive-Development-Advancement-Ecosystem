import { useState } from "react";
import { Box, Paper, TextField, Button, Typography, Alert, Avatar, Divider } from "@mui/material";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    headline: user?.headline || "",
    bio: user?.bio || "",
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [pwMessage, setPwMessage] = useState(null);
  const [pwError, setPwError] = useState(null);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const { data } = await api.put("/users/profile", form);
      updateUser(data.user);
      setMessage("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwMessage(null);
    setPwError(null);
    try {
      await api.put("/users/change-password", passwordForm);
      setPwMessage("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Password change failed");
    }
  };

  return (
    <Box sx={{ maxWidth: 640, mx: "auto", px: 3, py: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main", fontSize: 28 }}>
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h5">{user?.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }} elevation={1}>
        <Typography variant="h6" gutterBottom>
          Edit profile
        </Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleProfileSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField
            label="Headline"
            placeholder="e.g. Frontend Developer | React & Node"
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
          />
          <TextField
            label="Bio"
            multiline
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
            Save changes
          </Button>
        </Box>
      </Paper>

      <Divider />

      <Paper sx={{ p: 3 }} elevation={1}>
        <Typography variant="h6" gutterBottom>
          Change password
        </Typography>
        {pwMessage && <Alert severity="success" sx={{ mb: 2 }}>{pwMessage}</Alert>}
        {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
        <Box component="form" onSubmit={handlePasswordSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Current password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
          />
          <TextField
            label="New password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          />
          <Button type="submit" variant="outlined" sx={{ alignSelf: "flex-start" }}>
            Update password
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
