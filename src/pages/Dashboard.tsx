
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Activity, TrendingUp, Target, Calendar, Flame, Droplet, Utensils, Camera, Weight } from "lucide-react";
import { storageService, HabitData, NutritionData, BodyMeasurement, ProgressImage } from "@/services/storageService";
import { format, differenceInWeeks, addYears, subDays } from "date-fns";
import { de } from "date-fns/locale";

const Dashboard = () => {
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [todayNutrition, setTodayNutrition] = useState<NutritionData | null>(null);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [recentImages, setRecentImages] = useState<ProgressImage[]>([]);

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
    const imagesData = storageService.getProgressImages();
    
    setHabits(habitsData);
    setTodayNutrition(nutritionData);
    setBodyMeasurements(measurementsData);
    setRecentImages(imagesData.slice(-3)); // Last 3 images
  };

  // Calculate progress metrics
  const weeksTotal = differenceInWeeks(endDate, startDate);
  const weeksElapsed = differenceInWeeks(new Date(), startDate);
  const weeksRemaining = Math.max(0, weeksTotal - weeksElapsed);
  const yearProgress = Math.min(100, (weeksElapsed / weeksTotal) * 100);

  // Goals for the 4-year transformation
  const startWeight = 75;
  const goalWeight = 100;
  const startBodyFat = 12;
  const goalBodyFat = 8;

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

  // Chart data for recent progress (last 30 days)
  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const measurement = bodyMeasurements.find(m => m.date === dateStr);
    const nutrition = storageService.getNutrition(dateStr);
    
    return {
      date: format(date, "dd.MM"),
      weight: measurement?.weight || null,
      bodyFat: measurement?.bodyFat || null,
      calories: nutrition.calories,
      protein: nutrition.protein,
      water: nutrition.water
    };
  });

  // Weight trend chart data
  const weightTrendData = bodyMeasurements.slice(-10).map(m => ({
    date: format(new Date(m.date), "dd.MM"),
    weight: m.weight,
    bodyFat: m.bodyFat,
    muscleMass: m.muscleMass
  }));

  // Nutrition pie chart data
  const nutritionPieData = todayNutrition ? [
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

      {/* Current Stats & Recent Photos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card card-hover animate-slide-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-blue-400" />
              Aktuelle Messwerte
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestMeasurement ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat-container">
                    <div className="text-2xl font-bold text-primary">{latestMeasurement.weight} kg</div>
                    <div className="text-sm text-muted-foreground">Gewicht</div>
                  </div>
                  <div className="stat-container">
                    <div className="text-2xl font-bold text-orange-400">{latestMeasurement.bodyFat}%</div>
                    <div className="text-sm text-muted-foreground">Körperfett</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat-container">
                    <div className="text-2xl font-bold text-green-400">{latestMeasurement.muscleMass} kg</div>
                    <div className="text-sm text-muted-foreground">Muskelmasse</div>
                  </div>
                  <div className="stat-container">
                    <div className="text-2xl font-bold text-cyan-400">{latestMeasurement.height} cm</div>
                    <div className="text-sm text-muted-foreground">Größe</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Letztes Update: {format(new Date(latestMeasurement.date), "dd.MM.yyyy")}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Noch keine Messungen vorhanden</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card card-hover animate-slide-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-purple-400" />
              Neueste Progress-Fotos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {recentImages.map((image) => (
                  <div key={image.id} className="aspect-square overflow-hidden rounded-lg border border-primary/20">
                    <img
                      src={image.image}
                      alt={`Progress vom ${image.date}`}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Noch keine Fotos hochgeladen</p>
            )}
            {recentImages.length > 0 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Letztes Foto: {format(new Date(`${recentImages[recentImages.length - 1]?.date}`), "dd.MM.yyyy")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weight Progress Chart */}
        {weightTrendData.length > 0 && (
          <Card className="glass-card card-hover animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                Gewichtsentwicklung (Letzte 10 Messungen)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightTrendData}>
                    <defs>
                      <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1}
                      fill="url(#weightGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nutrition Progress Pie Chart */}
        {nutritionPieData.length > 0 && (
          <Card className="glass-card card-hover animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-blue-400" />
                Heutige Ernährung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={nutritionPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {nutritionPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value.toFixed(1)}%`, '']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="w-3 h-3 bg-blue-500 rounded mx-auto mb-1"></div>
                  <span>Kalorien</span>
                </div>
                <div>
                  <div className="w-3 h-3 bg-green-500 rounded mx-auto mb-1"></div>
                  <span>Protein</span>
                </div>
                <div>
                  <div className="w-3 h-3 bg-cyan-500 rounded mx-auto mb-1"></div>
                  <span>Wasser</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
