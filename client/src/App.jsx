import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import ResumeAnalysis from "./pages/ResumeAnalysis.jsx";
import InterviewSetup from "./pages/InterviewSetup.jsx";
import InterviewSession from "./pages/InterviewSession.jsx";
import InterviewHistory from "./pages/InterviewHistory.jsx";
import AskMeAnything from "./pages/AskMeAnything.jsx";
import CodingSetup from "./pages/CodingSetup.jsx";
import CodingPractice from "./pages/CodingPractice.jsx";
import CodingHistory from "./pages/CodingHistory.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/resume" element={<ResumeAnalysis />} />
            <Route path="/interview" element={<InterviewSetup />} />
            <Route path="/interview/:id" element={<InterviewSession />} />
            <Route path="/interviews" element={<InterviewHistory />} />
            <Route path="/chat" element={<AskMeAnything />} />
            <Route path="/chat/:id" element={<AskMeAnything />} />
            <Route path="/coding" element={<CodingSetup />} />
            <Route path="/coding/:id" element={<CodingPractice />} />
            <Route path="/coding-history" element={<CodingHistory />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
