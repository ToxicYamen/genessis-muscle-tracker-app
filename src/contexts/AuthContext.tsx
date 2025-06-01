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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in via localStorage
    const checkAuthStatus = () => {
      try {
        const persistentAuth = localStorage.getItem("isAuthenticated");
        const authTimestamp = localStorage.getItem("authTimestamp");
        const rememberMe = localStorage.getItem("rememberMe");
        
        // If remember me is enabled, stay logged in indefinitely
        if (persistentAuth === "true" && rememberMe === "true") {
          setIsAuthenticated(true);
        } 
        // Otherwise check if session is still valid (24 hours)
        else if (persistentAuth === "true" && authTimestamp) {
          const now = new Date().getTime();
          const authTime = parseInt(authTimestamp);
          const hoursPassed = (now - authTime) / (1000 * 60 * 60);
          
          if (hoursPassed < 24) {
            setIsAuthenticated(true);
          } else {
            // Session expired, clear auth data
            localStorage.removeItem("isAuthenticated");
            localStorage.removeItem("authTimestamp");
            localStorage.removeItem("rememberMe");
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (username: string, password: string, rememberMe: boolean = true): boolean => {
    // Simple authentication check
    if (
      username.toLowerCase() === defaultUser.username.toLowerCase() &&
      password === defaultUser.password
    ) {
      setIsAuthenticated(true);
      
      const now = new Date().getTime();
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("authTimestamp", now.toString());
      localStorage.setItem("rememberMe", rememberMe.toString());
      
      toast({
        title: "Erfolgreich angemeldet",
        description: rememberMe 
          ? "Du bleibst dauerhaft angemeldet." 
          : "Du bleibst 24 Stunden angemeldet.",
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
    localStorage.removeItem("authTimestamp");
    localStorage.removeItem("rememberMe");
    toast({
      title: "Abgemeldet",
      description: "Du wurdest erfolgreich abgemeldet.",
    });
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return null; // This will be handled by the Loader component
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
