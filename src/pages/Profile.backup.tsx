
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Flame,
  Activity,
  HeartPulse,
  Scale,
  Droplet,
  Utensils,
} from "lucide-react";
import { storageService } from "@/services/storageService";

const Profile = () => {
  const [name, setName] = useState("Dein Name");
  const [level, setLevel] = useState(7);
  const [experience, setExperience] = useState(78);
  const [calories, setCalories] = useState(2200);
  const [protein, setProtein] = useState(150);
  const [water, setWater] = useState(2500);
  const [weight, setWeight] = useState(82);
  const [bodyFat, setBodyFat] = useState(14);

  useEffect(() => {
    // Load data from local storage or other source
  }, []);

  const calculateLevelProgress = () => {
    const progress = (experience % 100) / 100;
    return Math.min(progress * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header Section */}
      <div className="bg-secondary py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            Dein Profil
          </h1>
          <p className="text-sm text-muted-foreground">
            Überblick über deine Fortschritte und Ziele.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                {name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Level {level}</p>
                  <Badge variant="secondary">{experience} XP</Badge>
                </div>
                <Progress value={calculateLevelProgress()} />
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                Kalorien
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{calories} kcal</p>
              <p className="text-sm text-muted-foreground">
                Ziel: {storageService.getNutrition(new Date().toISOString().split('T')[0]).targetCalories} kcal
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Protein
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{protein} g</p>
              <p className="text-sm text-muted-foreground">
                Ziel: {storageService.getNutrition(new Date().toISOString().split('T')[0]).targetProtein} g
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-primary" />
                Wasser
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{water} ml</p>
              <p className="text-sm text-muted-foreground">
                Ziel: {storageService.getNutrition(new Date().toISOString().split('T')[0]).targetWater} ml
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Gewicht
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{weight} kg</p>
              <p className="text-sm text-muted-foreground">
                Körperfett: {bodyFat}%
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" />
                Herzfrequenz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">72 bpm</p>
              <p className="text-sm text-muted-foreground">
                Ruheherzfrequenz
              </p>
            </CardContent>
          </Card>
          
          {/* Goals Section */}
          <div className="lg:col-span-3">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Meine Ziele
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Hier könnten individuelle Ziele stehen.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
