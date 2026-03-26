import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ NOVO

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const savedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser)); // ✅ user completo em vez de { logged: true }
    }

    setLoading(false); // ✅ só depois de verificar
  }, []);

  const handleLogin = (data) => {
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  return (
    <AuthContext.Provider value={{ user, loading, handleLogin, handleLogout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);