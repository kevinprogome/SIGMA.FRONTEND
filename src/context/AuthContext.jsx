import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);

      const decoded = jwtDecode(storedToken);

      if (decoded.role) {
        setRole(decoded.role);
      } else if (decoded.authorities?.length) {
        setRole(decoded.authorities[0].replace("ROLE_", ""));
      }
    }

    setLoading(false);
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    const decoded = jwtDecode(newToken);

    if (decoded.role) {
      setRole(decoded.role);
    } else if (decoded.authorities?.length) {
      setRole(decoded.authorities[0].replace("ROLE_", ""));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
