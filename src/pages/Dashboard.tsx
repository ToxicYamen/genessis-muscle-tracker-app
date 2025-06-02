
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Activity,
  Dumbbell,
  Apple,
  Droplets,
  Pill,
  Camera,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { supabaseStorageService } from "@/services/supabaseStorageService";

const Dashboard = () => {
  const [bodyMeasurements, setBodyMeasurements] = useState<any[]>([]);
  const [strengthRecords, setStrengthRecords] = useState<any[]>([]);
  const [nutritionRecords, setNutritionRecords] = useState<any[]>([]);
  const [progressImages, setProgressImages] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [habitCompletions, setHabitCompletions] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [
        bodyData,
        strengthData,
        nutritionData,
        imagesData,
        habitsData,
        completionsData
      ] = await Promise.all([
        supabaseStorageService.getBodyMeasurements(),
        supabaseStorageService.getStrengthRecords(),
        supabaseStorageService.getNutritionRecords(),
        supabaseStorageService.getProgressImages(),
        supabaseStorageService.getHabits(),
        supabaseStorageService.getHabitCompletions()
      ]);

      setBodyMeasurements(bodyData);
      setStrengthRecords(strengthData);
      setNutritionRecords(nutritionData);
      setProgressImages(imagesData);
      setHabits(habitsData);
      setHabitCompletions(completionsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Calculate weight trend data
  const weightTrendData = bodyMeasurements
    .filter(measurement => measurement.weight)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)
    .map(measurement => ({
      date: format(new Date(measurement.date), "dd.MM"),
      weight: measurement.weight
    }));

  // Calculate strength progress
  const latestStrengthRecords = strengthRecords
    .reduce((acc, record) => {
      if (!acc[record.exercise] || new Date(record.date) > new Date(acc[record.exercise].date)) {
        acc[record.exercise] = record;
      }
      return acc;
    }, {} as Record<string, any>);

  // Calculate nutrition progress for today
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayNutrition = nutritionRecords.find(record => record.date === today);

  // Calculate habit completion rate for this week
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  
  const thisWeekCompletions = habitCompletions.filter(completion => {
    const completionDate = new Date(completion.date);
    return completionDate >= weekStart && completionDate <= weekEnd;
  });

  const habitCompletionRate = habits.length > 0 
    ? (thisWeekCompletions.length / (habits.length * 7)) * 100
    : 0;

  // Recent achievements
  const recentAchievements = [
    ...strengthRecords.slice(-3).map(record => ({
      type: 'strength',
      title: `${record.exercise}: ${record.weight}kg`,
      date: record.date,
      icon: Dumbbell
    })),
    ...progressImages.slice(-2).map(image => ({
      type: 'progress',
      title: 'Neues Progress-Foto',
      date: image.date,
      icon: Camera
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-muted-foreground">
          Überblick über deine Fitness-Journey
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktuelles Gewicht</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {bodyMeasurements.length > 0 
                ? `${bodyMeasurements[bodyMeasurements.length - 1]?.weight || 0} kg`
                : '0 kg'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {weightTrendData.length > 1 && (
                <>
                  {weightTrendData[weightTrendData.length - 1].weight > weightTrendData[weightTrendData.length - 2].weight ? '+' : ''}
                  {(weightTrendData[weightTrendData.length - 1].weight - weightTrendData[weightTrendData.length - 2].weight).toFixed(1)} kg seit letzter Messung
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Krafttraining</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {Object.keys(latestStrengthRecords).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Übungen verfolgt
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ernährung heute</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {todayNutrition?.calories || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              kcal von {todayNutrition?.target_calories || 4864} Ziel
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Habits diese Woche</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {habitCompletionRate.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Completion Rate
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="progress">Fortschritt</TabsTrigger>
          <TabsTrigger value="strength">Kraft</TabsTrigger>
          <TabsTrigger value="nutrition">Ernährung</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Weight Trend */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Gewichtsverlauf (7 Tage)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {weightTrendData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weightTrendData}>
                        <defs>
                          <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
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
                          stroke="#3b82f6" 
                          fill="url(#colorWeight)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Noch keine Gewichtsdaten verfügbar</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Letzte Erfolge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAchievements.length > 0 ? (
                    recentAchievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                        <achievement.icon className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{achievement.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(achievement.date), "dd.MM.yyyy", { locale: de })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Noch keine Erfolge verzeichnet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strength" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Aktuelle Kraftwerte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(latestStrengthRecords).map(([exercise, record]) => (
                  <div key={exercise} className="glass-card rounded-xl p-4 border border-primary/20">
                    <h3 className="font-medium text-sm">{exercise}</h3>
                    <div className="text-2xl font-bold text-primary">{record.weight} kg</div>
                    <p className="text-xs text-muted-foreground">
                      {record.sets}x{record.reps} • {format(new Date(record.date), "dd.MM.yyyy")}
                    </p>
                  </div>
                ))}
                {Object.keys(latestStrengthRecords).length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    Noch keine Kraftdaten verfügbar
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Ernährung heute</CardTitle>
            </CardHeader>
            <CardContent>
              {todayNutrition ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="glass-card rounded-xl p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Apple className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium">Kalorien</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-400">
                      {todayNutrition.calories || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      von {todayNutrition.target_calories} Ziel
                    </p>
                  </div>
                  
                  <div className="glass-card rounded-xl p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium">Protein</span>
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {todayNutrition.protein || 0}g
                    </div>
                    <p className="text-xs text-muted-foreground">
                      von {todayNutrition.target_protein}g Ziel
                    </p>
                  </div>
                  
                  <div className="glass-card rounded-xl p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium">Wasser</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-400">
                      {todayNutrition.water || 0}ml
                    </div>
                    <p className="text-xs text-muted-foreground">
                      von {todayNutrition.target_water}ml Ziel
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Noch keine Ernährungsdaten für heute
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Habit Übersicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">
                    {habitCompletionRate.toFixed(0)}%
                  </div>
                  <p className="text-muted-foreground">
                    Completion Rate diese Woche
                  </p>
                </div>
                
                <div className="grid gap-3 md:grid-cols-2">
                  {habits.map((habit) => {
                    const completionsThisWeek = thisWeekCompletions.filter(
                      completion => completion.habit_id === habit.id
                    ).length;
                    
                    return (
                      <div key={habit.id} className="glass-card rounded-xl p-3 border border-primary/20">
                        <h4 className="font-medium text-sm">{habit.name}</h4>
                        <div className="text-lg font-bold text-primary">
                          {completionsThisWeek}/7
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Diese Woche abgeschlossen
                        </p>
                      </div>
                    );
                  })}
                  {habits.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-4">
                      Noch keine Habits erstellt
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
