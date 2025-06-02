
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { defaultUser } from "../data/initialData";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextProps {
  isAuthenticated: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Legacy AuthProvider for backward compatibility
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // This is now a legacy provider - redirect to use Supabase auth
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string, rememberMe: boolean = true): boolean => {
    // Legacy login function - should not be used with Supabase
    if (
      username.toLowerCase() === defaultUser.username.toLowerCase() &&
      password === defaultUser.password
    ) {
      setIsAuthenticated(true);
      
      toast({
        title: "Hinweis",
        description: "Bitte verwende die neue Anmeldung mit Supabase.",
        variant: "destructive",
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
    toast({
      title: "Abgemeldet",
      description: "Du wurdest erfolgreich abgemeldet.",
    });
  };

  if (isLoading) {
    return null;
  }

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
