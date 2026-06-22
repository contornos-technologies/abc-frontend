import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem('abc_token'));
  const [user, setUser]     = useState(() => {
    try {
      const t = localStorage.getItem('abc_token');
      if (!t) return null;
      // Decode JWT payload (base64)
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload; // { userId, role, studentId, fullName?, email? }
    } catch {
      return null;
    }
  });

  // Enrich user with profile data after login
  // so Sidebar can show fullName + email
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('abc_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  function login(newToken, profileData) {
    localStorage.setItem('abc_token', newToken);
    if (profileData) {
      localStorage.setItem('abc_profile', JSON.stringify(profileData));
      setProfile(profileData);
    }
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUser(payload);
    } catch {
      setUser(null);
    }
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem('abc_token');
    localStorage.removeItem('abc_profile');
    setToken(null);
    setUser(null);
    setProfile(null);
  }

  // Merge JWT payload with profile data so Sidebar gets fullName + email
  //
  // ⚠️ Correcção: a resposta real de POST /auth/login devolve `user` (o registo
  // User, com `fullName: null`) com o Student aninhado em `user.student.fullName`
  // — o inverso da forma "Student com user aninhado" assumida antes aqui.
  // Cobrimos as duas formas possíveis, para não voltar a partir se outro fluxo
  // (ex: signup) passar a forma contrária.
  const enrichedUser = user
    ? {
        ...user,
        fullName:
          profile?.fullName ||
          profile?.student?.fullName ||
          user?.fullName ||
          '',
        email:
          profile?.email ||
          profile?.user?.email ||
          user?.email ||
          '',
      }
    : null;

    const isSuperAdmin = enrichedUser?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider value={{ user: enrichedUser, token, login, logout, setProfile, isSuperAdmin}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
