
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { TrendingUp, Target, Zap, Droplet, Dumbbell, Calendar, Trophy } from "lucide-react";
import { supabaseStorageService } from "@/services/supabaseStorageService";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface DashboardData {
  bodyMeasurements: any[];
  nutritionRecords: any[];
  strengthRecords: any[];
  habits: any[];
  habitCompletions: any[];
  supplements: any[];
  supplementCompletions: any[];
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData>({
    bodyMeasurements: [],
    nutritionRecords: [],
    strengthRecords: [],
    habits: [],
    habitCompletions: [],
    supplements: [],
    supplementCompletions: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        bodyMeasurements,
        nutritionRecords,
        strengthRecords,
        habits,
        habitCompletions,
        supplements,
        supplementCompletions
      ] = await Promise.all([
        supabaseStorageService.getBodyMeasurements(),
        supabaseStorageService.getNutritionRecords(),
        supabaseStorageService.getStrengthRecords(),
        supabaseStorageService.getHabits(),
        supabaseStorageService.getHabitCompletions(),
        supabaseStorageService.getSupplements(),
        supabaseStorageService.getSupplementCompletions()
      ]);

      setData({
        bodyMeasurements,
        nutritionRecords,
        strengthRecords,
        habits,
        habitCompletions,
        supplements,
        supplementCompletions
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get today's nutrition
  const todaysNutrition = data.nutritionRecords.find(
    record => record.date === format(new Date(), 'yyyy-MM-dd')
  );

  // Get weight trend data for chart
  const weightTrendData = data.bodyMeasurements
    .slice(-7)
    .map(measurement => ({
      date: format(parseISO(measurement.date), "dd.MM"),
      weight: measurement.weight
    }));

  // Calculate completion rates
  const today = format(new Date(), 'yyyy-MM-dd');
  const completedHabits = data.habitCompletions.filter(
    completion => completion.date === today
  ).length;
  const totalHabits = data.habits.length;
  
  const completedSupplements = data.supplementCompletions.filter(
    completion => completion.date === today && completion.taken
  ).length;
  const totalSupplements = data.supplements.length;

  // Get recent strength records
  const recentStrengthRecords = data.strengthRecords
    .slice(-5)
    .reverse();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Bitte melde dich an, um dein Dashboard zu sehen.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Lade Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-muted-foreground">Dein persönlicher Fitness-Überblick</p>
      </div>

      {/* Today's Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kalorien heute</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaysNutrition?.calories || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ziel: {todaysNutrition?.target_calories || 4864} kcal
            </p>
            <Progress 
              value={todaysNutrition ? (todaysNutrition.calories / todaysNutrition.target_calories) * 100 : 0} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protein heute</CardTitle>
            <Target className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaysNutrition?.protein || 0}g
            </div>
            <p className="text-xs text-muted-foreground">
              Ziel: {todaysNutrition?.target_protein || 280}g
            </p>
            <Progress 
              value={todaysNutrition ? (todaysNutrition.protein / todaysNutrition.target_protein) * 100 : 0} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Habits heute</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedHabits}/{totalHabits}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0}% abgeschlossen
            </p>
            <Progress 
              value={totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supplements</CardTitle>
            <Droplet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedSupplements}/{totalSupplements}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalSupplements > 0 ? Math.round((completedSupplements / totalSupplements) * 100) : 0}% eingenommen
            </p>
            <Progress 
              value={totalSupplements > 0 ? (completedSupplements / totalSupplements) * 100 : 0} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weight Trend */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Gewichtsverlauf (7 Tage)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {weightTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightTrendData}>
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
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Keine Gewichtsdaten verfügbar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Strength Records */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Letzte Krafteinträge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentStrengthRecords.length > 0 ? (
                recentStrengthRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{record.exercise}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(parseISO(record.date), "dd.MM.yyyy", { locale: de })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{record.weight}kg</div>
                      <div className="text-sm text-muted-foreground">
                        {record.sets}x{record.reps}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Keine Kraftdaten verfügbar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Body Stats */}
      {data.bodyMeasurements.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Aktuelle Körperdaten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              {(() => {
                const latest = data.bodyMeasurements[0];
                return (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{latest.weight || '-'}</div>
                      <div className="text-sm text-muted-foreground">Gewicht (kg)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{latest.height || '-'}</div>
                      <div className="text-sm text-muted-foreground">Größe (cm)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{latest.body_fat || '-'}</div>
                      <div className="text-sm text-muted-foreground">Körperfett (%)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{latest.muscle_mass || '-'}</div>
                      <div className="text-sm text-muted-foreground">Muskelmasse (kg)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{latest.chest || '-'}</div>
                      <div className="text-sm text-muted-foreground">Brust (cm)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{latest.waist || '-'}</div>
                      <div className="text-sm text-muted-foreground">Taille (cm)</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
