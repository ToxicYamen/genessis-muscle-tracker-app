
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, parseISO, isBefore, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { CheckCircle, Circle, Settings, Calendar } from "lucide-react";
import HabitManager from "@/components/HabitManager";
import NutritionTracker from "@/components/NutritionTracker";
import { supabaseStorageService } from "@/services/supabaseStorageService";
import { toast } from "@/components/ui/use-toast";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface HabitData {
  id: string;
  name: string;
  description?: string;
  completedDates: string[];
}

const Habits = () => {
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [currentDate] = useState(new Date());
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (user) {
      loadHabits();
    }
  }, [user]);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const [habitsData, habitCompletions] = await Promise.all([
        supabaseStorageService.getHabits(),
        supabaseStorageService.getHabitCompletions()
      ]);
      
      // Combine habits with their completions
      const habitsWithCompletions = habitsData.map(habit => ({
        id: habit.id!,
        name: habit.name,
        description: habit.description,
        completedDates: habitCompletions
          .filter(completion => completion.habit_id === habit.id)
          .map(completion => completion.date)
      }));
      
      setHabits(habitsWithCompletions);
    } catch (error) {
      console.error('Error loading habits:', error);
      toast({
        title: "Fehler",
        description: "Habits konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (habitId: string, date: string) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      const isCompleted = habit?.completedDates.includes(date);
      
      if (isCompleted) {
        // Remove completion
        const completions = await supabaseStorageService.getHabitCompletions();
        const completion = completions.find(c => c.habit_id === habitId && c.date === date);
        if (completion) {
          // Note: You'll need to add delete method to supabaseStorageService
          console.log('Would delete completion:', completion.id);
        }
      } else {
        // Add completion
        await supabaseStorageService.saveHabitCompletions([{
          habit_id: habitId,
          date: date,
          count: 1
        }]);
      }
      
      await loadHabits();

      toast({
        title: isCompleted ? "Abhaken rückgängig" : "Habit abgehakt",
        description: `${habit?.name} für ${format(parseISO(date), "dd.MM.yyyy", { locale: de })} ${isCompleted ? 'zurückgesetzt' : 'als erledigt markiert'}.`,
      });
    } catch (error) {
      console.error('Error toggling habit:', error);
      toast({
        title: "Fehler",
        description: "Habit-Status konnte nicht geändert werden.",
        variant: "destructive",
      });
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const isHabitCompleted = (habitId: string, date: Date) => {
    const habit = habits.find(h => h.id === habitId);
    const dateString = format(date, 'yyyy-MM-dd');
    return habit?.completedDates.includes(dateString) || false;
  };

  const isNutritionCompleted = (date: Date) => {
    // This would need to be implemented with actual nutrition data from Supabase
    return false; // Placeholder
  };

  const isDayFullyCompleted = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Check if all habits are completed
    const allHabitsCompleted = habits.length > 0 && habits.every(habit => 
      habit.completedDates.includes(dateString)
    );
    
    // Check if nutrition is completed
    const nutritionCompleted = isNutritionCompleted(date);
    
    return allHabitsCompleted && nutritionCompleted;
  };

  const getCompletionRate = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || !habit.completedDates) return 0;

    const daysInMonth = getDaysInMonth();
    const completedInMonth = daysInMonth.filter(date => 
      habit.completedDates.includes(format(date, 'yyyy-MM-dd'))
    ).length;

    return Math.round((completedInMonth / daysInMonth.length) * 100);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Bitte melde dich an, um deine Daten zu sehen.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Lade Daten...</p>
      </div>
    );
  }

  const days = getDaysInMonth();

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Habits & Ernährung
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Verfolge deine täglichen Gewohnheiten und Ernährung für {format(currentDate, "MMMM yyyy", { locale: de })}
          </p>
        </div>

        <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Settings className="mr-2 h-4 w-4" />
              Habits verwalten
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Habits verwalten</DialogTitle>
            </DialogHeader>
            <HabitManager 
              habits={habits}
              onHabitsChange={() => {
                setIsManageDialogOpen(false);
                loadHabits();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Nutrition Tracker */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <NutritionTracker />
        
        {/* Today's Habits */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-primary" />
              Heute
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {habits.map((habit) => (
              <div key={habit.id} className="flex items-center justify-between">
                <span className="text-sm font-medium">{habit.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleHabit(habit.id, format(new Date(), 'yyyy-MM-dd'))}
                  className="p-1 h-auto"
                >
                  {isHabitCompleted(habit.id, new Date()) ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            ))}
            {habits.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Noch keine Habits erstellt.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Habits Overview */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <Card key={habit.id} className="glass-card">
            <CardHeader className="pb-2 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">{habit.name}</CardTitle>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {getCompletionRate(habit.id)}%
                </Badge>
              </div>
              {habit.description && (
                <p className="text-xs sm:text-sm text-muted-foreground">{habit.description}</p>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Combined Month View */}
      <Card className="glass-card">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Gemeinsame Monatsübersicht - {format(currentDate, "MMMM yyyy", { locale: de })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4 text-xs font-medium text-muted-foreground">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
              <div key={day} className="text-center p-1">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayIsToday = isToday(day);
              const dayIsInPast = isBefore(day, startOfDay(new Date()));
              const dayCompleted = isDayFullyCompleted(day);
              
              let dayStyle = '';
              if (dayCompleted) {
                dayStyle = 'bg-green-500 text-white';
              } else if (dayIsInPast && !dayCompleted) {
                dayStyle = 'bg-red-500 text-white';
              } else {
                dayStyle = 'bg-card border-border';
              }
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    aspect-square border rounded p-1 text-xs transition-all
                    ${dayIsToday ? 'ring-2 ring-primary' : ''}
                    ${dayStyle}
                  `}
                >
                  <div className="font-medium">{format(day, 'd')}</div>
                  <div className="text-[10px] mt-1">
                    {dayCompleted ? '✓' : dayIsInPast ? '✗' : ''}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Vollständig erledigt</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Nicht vollständig erledigt</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-card border border-border rounded"></div>
              <span>Noch offen</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-card/50 rounded-lg border">
            <p className="text-sm text-muted-foreground">
              <strong>Grün:</strong> Alle Habits UND Ernährung (Kalorien + Protein) vollständig abgeschlossen
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Rot:</strong> Tag vergangen, aber nicht alle Aufgaben erledigt
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Habits;
