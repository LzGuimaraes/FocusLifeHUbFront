import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  token: string | null;
  user: any | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function getValidTokenFromStorage(): string | null {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") {
    localStorage.removeItem("token"); 
    return null;
  }
  return token;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(getValidTokenFromStorage());
  const [user, setUser] = useState(() => {
    const t = getValidTokenFromStorage();
    return t ? jwtDecode(t) : null;
  });

  const login = (token: string) => {
    if (token && token !== "undefined" && token !== "null") {
      localStorage.setItem("token", token);
      setToken(token);
      setUser(jwtDecode(token));
    } else {
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
