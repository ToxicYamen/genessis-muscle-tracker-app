
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SupabaseAuthProvider, useSupabaseAuth } from "./contexts/SupabaseAuthContext";
import { DataProvider } from "./contexts/DataContext";
import Loader from "./components/Loader";
import Auth from "./pages/Auth";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import BodyTracking from "./pages/BodyTracking";
import Measurements from "./pages/Measurements";
import Strength from "./pages/Strength";
import Workout from "./pages/Workout";
import Supplements from "./pages/Supplements";
import Profile from "./pages/Profile";
import Gallery from "./pages/Gallery";
import Habits from "./pages/Habits";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// App content with loader
const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isLoading: authLoading } = useSupabaseAuth();

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Reduced loader time since we have auth loading

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || authLoading) {
    return <Loader />;
  }

  return <AppRoutes />;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSupabaseAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Layout>
      {children}
    </Layout>
  );
};

// Public route component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSupabaseAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Routes component
const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route 
        path="/auth" 
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } 
      />
      <Route 
        path="/login" 
        element={<Navigate to="/auth" replace />}
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/body-tracking" 
        element={
          <ProtectedRoute>
            <BodyTracking />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/measurements" 
        element={
          <ProtectedRoute>
            <Measurements />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/strength" 
        element={
          <ProtectedRoute>
            <Strength />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/workout" 
        element={
          <ProtectedRoute>
            <Workout />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/supplements" 
        element={
          <ProtectedRoute>
            <Supplements />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gallery" 
        element={
          <ProtectedRoute>
            <Gallery />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/habits" 
        element={
          <ProtectedRoute>
            <Habits />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SupabaseAuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </DataProvider>
      </SupabaseAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
