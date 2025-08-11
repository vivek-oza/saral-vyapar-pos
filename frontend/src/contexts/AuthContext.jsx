import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, signupUser, getCurrentUser } from "../api/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem("token");
    const hydrate = async () => {
      if (token) {
        try {
          const { data } = await getCurrentUser();
          if (data?.success && data?.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
          } else {
            // Fallback to cached user if available
            const cached = localStorage.getItem("user");
            if (cached) setUser(JSON.parse(cached));
          }
        } catch (_) {
          // Token invalid/expired -> clear stale auth
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };
    hydrate();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      const { token, user: userData } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const signup = async (email, password, shopData) => {
    try {
      // First create the user account
      const signupResponse = await signupUser(email, password);

      // If signup successful, create the shop
      if (signupResponse.data.success) {
        // Login the user to get token
        const loginResponse = await loginUser(email, password);
        const { token, user: userData } = loginResponse.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        // Create shop with authenticated user
        const apiUrl =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const shopResponse = await fetch(`${apiUrl}/shop/setup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(shopData),
        });

        if (!shopResponse.ok) {
          throw new Error("Failed to create shop");
        }
        // After shop creation, refresh user so it includes shop
        try {
          const { data } = await getCurrentUser();
          if (data?.success && data?.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
          }
        } catch (_) {
          /* ignore */
        }

        return { success: true };
      }

      return { success: false, error: "Signup failed" };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Signup failed",
      };
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await getCurrentUser();
      if (data?.success && data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to refresh user",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    refreshUser,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
