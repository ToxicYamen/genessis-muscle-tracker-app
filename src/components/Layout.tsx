
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, User, BarChart, Activity, Calendar, Database } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { logout } = useAuth();
  const location = useLocation();
  
  const navigation = [
    { name: "Dashboard", href: "/", icon: Activity },
    { name: "Messwerte", href: "/measurements", icon: BarChart },
    { name: "Kraftentwicklung", href: "/strength", icon: Database },
    { name: "Training", href: "/workout", icon: Calendar },
    { name: "Profil", href: "/profile", icon: User },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarContent className="flex flex-col py-6">
            <div className="px-3 mb-6">
              <h2 className="text-2xl font-bold tracking-tight">GENESIS 4</h2>
              <p className="text-sm text-muted-foreground mt-1">4-Jahres-Plan</p>
            </div>
            
            <div className="px-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive(item.href)
                      ? "bg-secondary text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-primary"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </div>
            
            <div className="mt-auto px-3 pt-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-muted-foreground"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen">
          <div className="flex items-center h-14 px-4 border-b gap-4 lg:gap-8">
            <SidebarTrigger />
            <h1 className="text-lg font-medium">
              {navigation.find(item => isActive(item.href))?.name || "Dashboard"}
            </h1>
          </div>
          
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
