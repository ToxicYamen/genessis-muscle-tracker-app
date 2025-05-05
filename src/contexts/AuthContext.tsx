
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { defaultUser } from "../data/initialData";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextProps {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in via localStorage
    const storedAuth = localStorage.getItem("isAuthenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Simple authentication check
    if (
      username.toLowerCase() === defaultUser.username.toLowerCase() &&
      password === defaultUser.password
    ) {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      toast({
        title: "Erfolgreich angemeldet",
        description: "Willkommen zurück bei Genesis 4.",
      });
      return true;
    } else {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: "Ungültiger Benutzername oder Passwort.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    toast({
      title: "Abgemeldet",
      description: "Du wurdest erfolgreich abgemeldet.",
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
