
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, User, BarChart, Activity, Calendar, Database, ScaleIcon, CameraIcon, Pill, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { logout } = useAuth();
  const location = useLocation();
  
  const navigation = [
    { name: "Dashboard", href: "/", icon: Activity },
    { name: "Körper-Tracking", href: "/body-tracking", icon: ScaleIcon },
    { name: "Messwerte", href: "/measurements", icon: BarChart },
    { name: "Kraftentwicklung", href: "/strength", icon: Database },
    { name: "Progress Galerie", href: "/gallery", icon: CameraIcon },
    { name: "Training", href: "/workout", icon: Calendar },
    { name: "Habits", href: "/habits", icon: Heart },
    { name: "Supplements", href: "/supplements", icon: Pill },
    { name: "Profil", href: "/profile", icon: User },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border hidden lg:block">
          <SidebarContent className="flex flex-col py-6">
            <motion.div 
              className="px-3 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                GENESIS 4
              </h2>
              <p className="text-sm text-muted-foreground mt-1">4-Jahres-Transformation</p>
            </motion.div>
            
            <div className="px-3 space-y-1">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-primary/20 text-primary font-medium shadow-lg border border-primary/30"
                        : "text-muted-foreground hover:bg-secondary hover:text-primary hover:shadow-md"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="mt-auto px-3 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-muted-foreground rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </Button>
            </motion.div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen">
          <div className="flex items-center h-14 px-4 border-b gap-4 lg:gap-8 bg-card/50 backdrop-blur-sm">
            <SidebarTrigger className="lg:hidden" />
            <motion.h1 
              className="text-lg font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {navigation.find(item => isActive(item.href))?.name || "Dashboard"}
            </motion.h1>
            
            {/* Mobile Navigation */}
            <div className="lg:hidden ml-auto">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {navigation.slice(0, 4).map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
                      isActive(item.href)
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <item.icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <motion.div 
            className="flex-1 p-4 lg:p-6 overflow-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
