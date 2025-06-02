import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "./Dashboard";
import BodyTracking from "./BodyTracking";
import Measurements from "./Measurements";
import StrengthTracking from "./StrengthTracking";
import Training from "./Training";
import Habits from "./Habits";
import Supplements from "./Supplements";
import Gallery from "./Gallery";
import Profile from "./Profile";
import FlashcardDrill from "../components/FlashcardDrill";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "body-tracking":
        return <BodyTracking />;
      case "measurements":
        return <Measurements />;
      case "strength":
        return <StrengthTracking />;
      case "training":
        return <Training />;
      case "habits":
        return <Habits />;
      case "supplements":
        return <Supplements />;
      case "gallery":
        return <Gallery />;
      case "profile":
        return <Profile />;
      case "flashcards":
        return <FlashcardDrill />;
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "body-tracking", label: "Körper-Tracking", icon: "⚖️" },
    { id: "measurements", label: "Messwerte", icon: "📏" },
    { id: "strength", label: "Kraftentwicklung", icon: "💪" },
    { id: "training", label: "Training", icon: "🏋️" },
    { id: "habits", label: "Habits", icon: "✅" },
    { id: "supplements", label: "Supplements", icon: "💊" },
    { id: "gallery", label: "Galerie", icon: "📸" },
    { id: "profile", label: "Profil", icon: "👤" },
    { id: "flashcards", label: "Flashcards", icon: "🧠" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-gray-200 flex flex-col">
        <div className="p-4">
          <h1 className="text-2xl font-bold">GENESIS 4</h1>
        </div>
        <TabsList className="flex-1 p-4">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setCurrentPage(item.id)}
            >
              {item.icon} {item.label}
            </Button>
          ))}
        </TabsList>
        <div className="p-4 text-center">
          <p className="text-xs">© 2024 Yamen</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        <Card>
          <CardHeader>
            <CardTitle>
              {navItems.find((item) => item.id === currentPage)?.label || "Dashboard"}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderPage()}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
