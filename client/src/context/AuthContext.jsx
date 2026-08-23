import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);
const GUEST_KEY = "prepverse_guest";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(
    () => sessionStorage.getItem(GUEST_KEY) === "true",
  );

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    if (data.token) localStorage.setItem("token", data.token);
    setUser(data.user);
    exitGuest();
    return data.user;
  };

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    if (data.token) localStorage.setItem("token", data.token);
    setUser(data.user);
    exitGuest();
    return data.user;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    localStorage.removeItem("token");
    setUser(null);
    exitGuest();
  };

  const updateUser = (updated) => setUser(updated);

  // Guest mode: lets someone explore the dashboard without creating an
  // account. It's session-only (cleared on tab close) and never touches
  // the backend - it's purely a frontend affordance for browsing.
  const continueAsGuest = () => {
    sessionStorage.setItem(GUEST_KEY, "true");
    setIsGuest(true);
  };

  const exitGuest = () => {
    sessionStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
        register,
        login,
        logout,
        updateUser,
        refetch: fetchMe,
        continueAsGuest,
        exitGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
