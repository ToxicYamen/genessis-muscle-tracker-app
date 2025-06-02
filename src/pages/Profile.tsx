
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Scale, Ruler, Activity, Target, Utensils, Calendar } from "lucide-react";
import { useStore } from "@/store/useStore";
import { toast } from "@/components/ui/use-toast";

const Profile = () => {
  const { height, weight, bodyFat, setHeight, setWeight, setBodyFat } = useStore();
  
  const [profile, setProfile] = useState({
    name: "Yamen",
    age: 18,
    birthday: "2006-06-06", // 06.06 - wird 19
    dailyCalories: 4864,
    dailyProtein: 280
  });

  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  useEffect(() => {
    // Lade Profil aus localStorage falls vorhanden
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setTempProfile(parsed);
    }
  }, []);

  const saveProfile = () => {
    setProfile(tempProfile);
    localStorage.setItem('user_profile', JSON.stringify(tempProfile));
    setEditMode(false);
    
    toast({
      title: "Profil gespeichert",
      description: "Deine Profildaten wurden erfolgreich aktualisiert.",
    });
  };

  const cancelEdit = () => {
    setTempProfile(profile);
    setEditMode(false);
  };

  // Transformation year calculation
  const transformationStartDate = new Date('2025-01-01');
  const currentDate = new Date();
  const nextBirthday = new Date('2025-06-06');
  const yearsSinceStart = Math.floor((currentDate.getTime() - transformationStartDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const currentTransformationYear = Math.max(1, Math.min(4, yearsSinceStart + 1));
  
  // Age calculation
  const currentAge = currentDate >= nextBirthday ? 19 : 18;

  // BMI calculation
  const bmi = height && weight ? (weight / Math.pow(height / 100, 2)).toFixed(1) : null;

  // Transformation progress
  const getTransformationProgress = () => {
    const startWeight = 75;
    const targetWeight = 100;
    const currentWeight = weight || startWeight;
    const progress = ((currentWeight - startWeight) / (targetWeight - startWeight)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Profil
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">Verwalte deine persönlichen Daten und Ziele</p>
        </div>
        
        {!editMode ? (
          <Button onClick={() => setEditMode(true)} variant="outline" className="w-full sm:w-auto">
            Bearbeiten
          </Button>
        ) : (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={saveProfile} className="flex-1 sm:flex-none">
              Speichern
            </Button>
            <Button onClick={cancelEdit} variant="outline" className="flex-1 sm:flex-none">
              Abbrechen
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Persönliche Daten */}
        <Card className="glass-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Persönliche Daten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              {editMode ? (
                <Input
                  id="name"
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">{profile.name}</span>
                  <Badge variant="secondary">User</Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Alter & Geburtstag
              </Label>
              {editMode ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={tempProfile.age}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    placeholder="Alter"
                  />
                  <Input
                    type="date"
                    value={tempProfile.birthday}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, birthday: e.target.value }))}
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-lg font-medium">{currentAge} Jahre</div>
                  <div className="text-sm text-muted-foreground">
                    Geburtstag: 06.06 {currentDate >= nextBirthday ? "(bereits gefeiert)" : "(nächster Geburtstag)"}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Körperdaten (automatisch synchronisiert)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Größe
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium">{height || "—"} cm</span>
                    <Badge variant="outline" className="text-xs">Auto</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Gewicht
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium">{weight || "—"} kg</span>
                    <Badge variant="outline" className="text-xs">Auto</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Körperfett
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium">{bodyFat || "—"}%</span>
                    <Badge variant="outline" className="text-xs">Auto</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>BMI</Label>
                  <div className="text-lg font-medium">
                    {bmi || "—"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ernährungsziele */}
        <Card className="glass-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              Ernährungsziele
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calories" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Täglicher Kalorienbedarf
              </Label>
              {editMode ? (
                <Input
                  id="calories"
                  type="number"
                  value={tempProfile.dailyCalories}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, dailyCalories: parseInt(e.target.value) }))}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-blue-400">{profile.dailyCalories}</span>
                  <span className="text-muted-foreground">kcal/Tag</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="protein" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Proteinbedarf
              </Label>
              {editMode ? (
                <Input
                  id="protein"
                  type="number"
                  value={tempProfile.dailyProtein}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, dailyProtein: parseInt(e.target.value) }))}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-green-400">{profile.dailyProtein}</span>
                  <span className="text-muted-foreground">g/Tag</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Berechnete Werte</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Protein/kg:</span>
                  <span className="ml-2 font-medium">
                    {weight ? (profile.dailyProtein / weight).toFixed(1) : "—"} g/kg
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Kcal/kg:</span>
                  <span className="ml-2 font-medium">
                    {weight ? (profile.dailyCalories / weight).toFixed(0) : "—"} kcal/kg
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GENESIS 4 Transformation */}
      <Card className="glass-card">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
            GENESIS 4 Transformation - Jahr {currentTransformationYear}/4
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Status */}
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
              <div className="text-center p-4 border rounded-lg bg-card/50">
                <div className="text-sm text-muted-foreground mb-2">Startgewicht</div>
                <div className="text-xl sm:text-2xl font-bold text-blue-400">75 kg</div>
                <div className="text-xs text-muted-foreground mt-1">Januar 2025</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg bg-card/50">
                <div className="text-sm text-muted-foreground mb-2">Aktuell</div>
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {weight ? `${weight} kg` : "75 kg"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {weight ? `+${(weight - 75).toFixed(1)} kg` : "Startphase"}
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg bg-card/50">
                <div className="text-sm text-muted-foreground mb-2">Zielgewicht</div>
                <div className="text-xl sm:text-2xl font-bold text-green-400">100 kg</div>
                <div className="text-xs text-muted-foreground mt-1">Dezember 2028</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Transformation Fortschritt</span>
                <span>{getTransformationProgress().toFixed(1)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getTransformationProgress()}%` }}
                ></div>
              </div>
            </div>
            
            <Separator />
            
            {/* Year Goals */}
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="text-center p-4 border rounded-lg bg-card/50">
                <div className="text-sm text-muted-foreground mb-2">Körperfett Start → Ziel</div>
                <div className="text-lg sm:text-xl font-bold text-orange-400">12% → 8%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Aktuell: {bodyFat ? `${bodyFat}%` : "— %"}
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg bg-card/50">
                <div className="text-sm text-muted-foreground mb-2">Lean Mass Zunahme (Ziel)</div>
                <div className="text-lg sm:text-xl font-bold text-cyan-400">~22 kg</div>
                <div className="text-xs text-muted-foreground mt-1">Reine Muskelmasse</div>
              </div>
            </div>

            {/* Transformation Year Info */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h4 className="font-medium text-primary mb-2">Jahr {currentTransformationYear} Fokus:</h4>
              <p className="text-sm text-muted-foreground">
                {currentTransformationYear === 1 && "Grundlagenaufbau, Technik perfektionieren, erste Masse aufbauen"}
                {currentTransformationYear === 2 && "Intensivierung des Trainings, gezielter Muskelaufbau, Ernährungsoptimierung"}
                {currentTransformationYear === 3 && "Fortgeschrittene Techniken, Kraft maximieren, Definition verbessern"}
                {currentTransformationYear === 4 && "Finalphase, Perfektion der Physique, Ziele erreichen"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Info */}
      <Card className="glass-card border border-primary/20">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium">Automatische Synchronisation aktiv</p>
              <p className="text-xs text-muted-foreground">
                Körperdaten werden automatisch aus dem Körper-Tracking übernommen und mit dem Dashboard synchronisiert
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
