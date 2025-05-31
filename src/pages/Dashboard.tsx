
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, TrendingUp, Target, Calendar, Flame, Droplet, Utensils } from "lucide-react";
import { storageService, HabitData, NutritionData, BodyMeasurement } from "@/services/storageService";
import { format, differenceInWeeks, addYears } from "date-fns";
import { de } from "date-fns/locale";

const Dashboard = () => {
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [todayNutrition, setTodayNutrition] = useState<NutritionData | null>(null);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);

  const today = format(new Date(), "yyyy-MM-dd");
  const startDate = new Date("2025-01-01");
  const endDate = addYears(startDate, 4);
  
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const habitsData = storageService.getHabits();
    const nutritionData = storageService.getNutrition(today);
    const measurementsData = storageService.getBodyMeasurements();
    
    setHabits(habitsData);
    setTodayNutrition(nutritionData);
    setBodyMeasurements(measurementsData);
  };

  // Calculate progress metrics
  const weeksTotal = differenceInWeeks(endDate, startDate);
  const weeksElapsed = differenceInWeeks(new Date(), startDate);
  const weeksRemaining = Math.max(0, weeksTotal - weeksElapsed);
  const yearProgress = Math.min(100, (weeksElapsed / weeksTotal) * 100);

  // Goals for the 4-year transformation
  const startWeight = 75; // kg
  const goalWeight = 100; // kg nach 4 Jahren
  const startBodyFat = 12; // %
  const goalBodyFat = 8; // %

  const latestMeasurement = bodyMeasurements[bodyMeasurements.length - 1];
  const currentWeight = latestMeasurement?.weight || startWeight;
  const currentBodyFat = latestMeasurement?.bodyFat || startBodyFat;

  const weightProgress = Math.min(100, ((currentWeight - startWeight) / (goalWeight - startWeight)) * 100);
  const bodyFatProgress = Math.min(100, ((startBodyFat - currentBodyFat) / (startBodyFat - goalBodyFat)) * 100);

  // Habit completion today
  const todayHabitsCompleted = habits.filter(habit => {
    const todayValue = habit.dates[today] || 0;
    return todayValue >= habit.target;
  }).length;

  const habitCompletionRate = habits.length > 0 ? (todayHabitsCompleted / habits.length) * 100 : 0;

  // Chart data for recent progress
  const recentMeasurements = bodyMeasurements.slice(-7).map(m => ({
    date: format(new Date(m.date), "dd.MM"),
    weight: m.weight,
    bodyFat: m.bodyFat
  }));

  // Nutrition progress data
  const nutritionProgress = todayNutrition ? [
    { name: "Kalorien", value: (todayNutrition.calories / todayNutrition.targetCalories) * 100, color: "#3b82f6" },
    { name: "Protein", value: (todayNutrition.protein / todayNutrition.targetProtein) * 100, color: "#22c55e" },
    { name: "Wasser", value: (todayNutrition.water / todayNutrition.targetWater) * 100, color: "#06b6d4" }
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            GENESIS 4 Dashboard
          </h2>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, dd. MMMM yyyy", { locale: de })}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{weeksRemaining}</div>
          <div className="text-sm text-muted-foreground">Wochen verbleibend</div>
        </div>
      </div>

      {/* 4-Year Progress Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card card-hover animate-scale-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              4-Jahres-Fortschritt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-2">{yearProgress.toFixed(1)}%</div>
            <Progress value={yearProgress} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              Jahr {Math.ceil(weeksElapsed / 52)} von 4
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              Gewichtszunahme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400 mb-2">
              {currentWeight} kg
            </div>
            <Progress value={weightProgress} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              Ziel: {goalWeight} kg (+{(currentWeight - startWeight).toFixed(1)} kg)
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-400" />
              Körperfett-Reduktion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400 mb-2">
              {currentBodyFat}%
            </div>
            <Progress value={bodyFatProgress} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              Ziel: {goalBodyFat}% (-{(startBodyFat - currentBodyFat).toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover animate-scale-in" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-400" />
              Heute: Habits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400 mb-2">
              {todayHabitsCompleted}/{habits.length}
            </div>
            <Progress value={habitCompletionRate} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              {habitCompletionRate.toFixed(0)}% abgeschlossen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card card-hover animate-slide-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-blue-400" />
              Heutige Ernährung
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayNutrition ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Kalorien</span>
                  <span className="font-mono text-sm">
                    {todayNutrition.calories}/{todayNutrition.targetCalories}
                  </span>
                </div>
                <Progress 
                  value={(todayNutrition.calories / todayNutrition.targetCalories) * 100} 
                  className="h-2" 
                />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Protein</span>
                  <span className="font-mono text-sm">
                    {todayNutrition.protein}g/{todayNutrition.targetProtein}g
                  </span>
                </div>
                <Progress 
                  value={(todayNutrition.protein / todayNutrition.targetProtein) * 100} 
                  className="h-2" 
                />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Wasser</span>
                  <span className="font-mono text-sm">
                    {todayNutrition.water.toFixed(1)}L/{todayNutrition.targetWater}L
                  </span>
                </div>
                <Progress 
                  value={(todayNutrition.water / todayNutrition.targetWater) * 100} 
                  className="h-2" 
                />
              </div>
            ) : (
              <p className="text-muted-foreground">Noch keine Ernährungsdaten für heute</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card card-hover animate-slide-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-400" />
              Heutige Habits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {habits.map(habit => {
                const todayValue = habit.dates[today] || 0;
                const completion = (todayValue / habit.target) * 100;
                
                return (
                  <div key={habit.id} className="flex items-center justify-between">
                    <span className="text-sm">{habit.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">
                        {todayValue}/{habit.target}
                      </span>
                      <div className="w-16">
                        <Progress value={completion} className="h-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {recentMeasurements.length > 0 && (
        <Card className="glass-card card-hover animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              Aktuelle Entwicklung (7 Tage)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentMeasurements}>
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bodyFat" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={{ fill: "#f97316", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivational Message */}
      <Card className="glass-card border border-primary/20 animate-fade-in" style={{ animationDelay: "0.6s" }}>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 text-primary">
              🚀 Du schaffst das!
            </h3>
            <p className="text-muted-foreground">
              Noch {weeksRemaining} Wochen bis zu deiner 4-Jahres-Transformation. 
              Jeden Tag zählt - bleib konsistent mit deinen Habits und Ernährung!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
