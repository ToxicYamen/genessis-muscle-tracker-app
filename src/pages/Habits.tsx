import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, DropletIcon, CircleCheckIcon, Utensils, PillIcon, PlusIcon, MinusIcon } from "lucide-react";
import { storageService, HabitData, NutritionData } from "@/services/storageService";
import { toast } from "@/components/ui/use-toast";
import HabitManager from "@/components/HabitManager";

const Habits = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [nutrition, setNutrition] = useState<NutritionData | null>(null);
  
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  
  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = () => {
    const habitsData = storageService.getHabits();
    const nutritionData = storageService.getNutrition(formattedDate);
    setHabits(habitsData);
    setNutrition(nutritionData);
  };

  const getIconComponent = (iconName: string) => {
    const icons = {
      'Utensils': Utensils,
      'Droplet': DropletIcon,
      'Pill': PillIcon,
      'CircleCheck': CircleCheckIcon
    };
    const IconComponent = icons[iconName as keyof typeof icons] || CircleCheckIcon;
    return <IconComponent className="h-5 w-5" />;
  };

  const incrementHabit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const currentValue = habit.dates[formattedDate] || 0;
    if (currentValue >= habit.target) {
      toast({
        title: "Maximum erreicht",
        description: `Du hast bereits das Tagesziel für ${habit.name} erreicht!`,
        variant: "destructive"
      });
      return;
    }

    const newValue = currentValue + 1;
    storageService.updateHabitProgress(habitId, formattedDate, newValue);
    loadData();
    
    toast({
      title: "Habit aktualisiert",
      description: `${habit.name}: ${newValue}/${habit.target}`,
    });
  };

  const decrementHabit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const currentValue = habit.dates[formattedDate] || 0;
    if (currentValue <= 0) return;

    const newValue = currentValue - 1;
    storageService.updateHabitProgress(habitId, formattedDate, newValue);
    loadData();
    
    toast({
      title: "Habit aktualisiert",
      description: `${habit.name}: ${newValue}/${habit.target}`,
    });
  };

  const addNutrition = (type: 'calories' | 'protein' | 'water', amount: number) => {
    if (!nutrition) return;
    
    storageService.addNutritionValue(formattedDate, type, amount);
    loadData();
    
    const labels = {
      calories: 'Kalorien',
      protein: 'Protein',
      water: 'Wasser'
    };
    
    toast({
      title: "Ernährung aktualisiert",
      description: `+${amount} ${labels[type]} hinzugefügt`,
    });
  };

  const subtractNutrition = (type: 'calories' | 'protein' | 'water', amount: number) => {
    if (!nutrition) return;
    
    const currentValue = nutrition[type];
    const newAmount = Math.max(0, currentValue - amount);
    const actualSubtracted = currentValue - newAmount;
    
    if (actualSubtracted > 0) {
      storageService.addNutritionValue(formattedDate, type, -actualSubtracted);
      loadData();
      
      const labels = {
        calories: 'Kalorien',
        protein: 'Protein',
        water: 'Wasser'
      };
      
      toast({
        title: "Ernährung aktualisiert",
        description: `-${actualSubtracted} ${labels[type]} entfernt`,
      });
    }
  };

  // Monthly overview data
  const currentMonth = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({ start: currentMonth, end: monthEnd });

  const getDateStatus = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dateHabits = habits.map(habit => {
      const completed = habit.dates[dateStr] || 0;
      return completed >= habit.target;
    });
    
    const allCompleted = dateHabits.length > 0 && dateHabits.every(Boolean);
    const someCompleted = dateHabits.some(Boolean);
    const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
    const isFuture = date > new Date();
    
    if (isFuture) return "future";
    if (allCompleted) return "success";
    if (someCompleted) return "partial";
    if (isToday) return "today";
    return "failed";
  };

  const weekStartDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStartDate, i));
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Habit Tracker
          </h2>
          <p className="text-muted-foreground">Verfolge deine täglichen Habits und Ernährung</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2 rounded-full glass-card">
            <CalendarIcon className="h-4 w-4" />
            {format(selectedDate, "EEEE, dd.MM.yyyy", { locale: de })}
          </Button>
        </div>
      </div>

      {/* Monthly Overview */}
      <Card className="glass-card card-hover animate-slide-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
            Monatliche Übersicht - {format(selectedDate, "MMMM yyyy", { locale: de })}
          </CardTitle>
          <CardDescription>Grün = Alle Ziele erreicht, Gelb = Teilweise erreicht, Rot = Ziele verfehlt</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day) => {
              const status = getDateStatus(day);
              const isSelected = format(day, "yyyy-MM-dd") === formattedDate;
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square p-2 rounded-lg text-sm font-medium transition-all border-2
                    ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                    ${status === "success" ? "bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30" : ""}
                    ${status === "partial" ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30" : ""}
                    ${status === "failed" ? "bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30" : ""}
                    ${status === "today" ? "bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30" : ""}
                    ${status === "future" ? "bg-muted/50 border-muted text-muted-foreground hover:bg-muted" : ""}
                  `}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Habit Management */}
      <HabitManager habits={habits} onHabitsChange={loadData} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card card-hover animate-slide-in">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
              Tägliche Habits
            </CardTitle>
            <CardDescription>Ergänzungen und Routinen für {format(selectedDate, "dd.MM.yyyy")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {habits.map((habit, index) => {
                const todayCompleted = habit.dates[formattedDate] || 0;
                const completion = Math.round((todayCompleted / habit.target) * 100);
                
                return (
                  <div 
                    key={habit.id} 
                    className="glass-card rounded-xl p-4 animate-scale-in border border-primary/20"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/20 rounded-full p-2 border border-primary/30">
                          {getIconComponent(habit.icon)}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{habit.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {todayCompleted} von {habit.target} • Streak: {habit.streak} Tage
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => decrementHabit(habit.id)}
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-full border-destructive/30 hover:bg-destructive/10"
                          disabled={todayCompleted <= 0}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => incrementHabit(habit.id)}
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-full border-primary/30 hover:bg-primary/10"
                          disabled={todayCompleted >= habit.target}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span>Fortschritt heute</span>
                        <span className="font-medium">{completion}%</span>
                      </div>
                      <Progress 
                        value={completion} 
                        className="h-3 bg-muted border border-primary/20" 
                      />
                    </div>
                    
                    <div className="flex justify-between gap-1">
                      {weekDays.map((day, i) => {
                        const dayKey = format(day, "yyyy-MM-dd");
                        const completed = habit.dates[dayKey] || 0;
                        const isToday = dayKey === format(new Date(), "yyyy-MM-dd");
                        const isSelected = dayKey === formattedDate;
                        
                        return (
                          <div key={i} className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground mb-1">
                              {format(day, "E", { locale: de })}
                            </span>
                            <div 
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all
                                ${completed >= habit.target 
                                  ? "bg-primary text-primary-foreground border-2 border-primary/50" 
                                  : completed > 0 
                                    ? "bg-primary/30 border-2 border-primary/50 text-primary-foreground" 
                                    : "bg-muted border-2 border-border"}
                                ${isToday ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-background" : ""}
                                ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                              `}
                            >
                              {completed > 0 ? completed : "-"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card card-hover animate-slide-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
              Ernährungstracker
            </CardTitle>
            <CardDescription>
              Kalorien, Protein und Wasser für {format(selectedDate, "dd.MM.yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nutrition && (
              <div className="space-y-6">
                <div className="glass-card rounded-xl p-4 border border-blue-400/20">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Kalorien</h3>
                    <span className="text-sm font-mono">
                      {nutrition.calories} / {nutrition.targetCalories} kcal
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (nutrition.calories / nutrition.targetCalories) * 100)} 
                    className="h-3 mb-4 bg-muted border border-blue-400/20" 
                  />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-green-500/30 hover:bg-green-500/10" 
                      onClick={() => addNutrition('calories', 200)}
                    >
                      +200
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-green-500/30 hover:bg-green-500/10" 
                      onClick={() => addNutrition('calories', 500)}
                    >
                      +500
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-green-500/30 hover:bg-green-500/10" 
                      onClick={() => addNutrition('calories', 1000)}
                    >
                      +1000
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-red-500/30 hover:bg-red-500/10" 
                      onClick={() => subtractNutrition('calories', 200)}
                    >
                      -200
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-red-500/30 hover:bg-red-500/10" 
                      onClick={() => subtractNutrition('calories', 500)}
                    >
                      -500
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-red-500/30 hover:bg-red-500/10" 
                      onClick={() => subtractNutrition('calories', 1000)}
                    >
                      -1000
                    </Button>
                  </div>
                </div>
                
                <div className="glass-card rounded-xl p-4 border border-green-400/20">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Protein</h3>
                    <span className="text-sm font-mono">
                      {nutrition.protein} / {nutrition.targetProtein} g
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (nutrition.protein / nutrition.targetProtein) * 100)} 
                    className="h-3 mb-4 bg-muted border border-green-400/20" 
                  />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-green-500/30 hover:bg-green-500/10" 
                      onClick={() => addNutrition('protein', 10)}
                    >
                      +10g
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-green-500/30 hover:bg-green-500/10" 
                      onClick={() => addNutrition('protein', 25)}
                    >
                      +25g
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-green-500/30 hover:bg-green-500/10" 
                      onClick={() => addNutrition('protein', 50)}
                    >
                      +50g
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-red-500/30 hover:bg-red-500/10" 
                      onClick={() => subtractNutrition('protein', 10)}
                    >
                      -10g
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-red-500/30 hover:bg-red-500/10" 
                      onClick={() => subtractNutrition('protein', 25)}
                    >
                      -25g
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-red-500/30 hover:bg-red-500/10" 
                      onClick={() => subtractNutrition('protein', 50)}
                    >
                      -50g
                    </Button>
                  </div>
                </div>
                
                <div className="glass-card rounded-xl p-4 border border-cyan-400/20">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Wasser</h3>
                    <span className="text-sm font-mono">
                      {nutrition.water.toFixed(1)} / {nutrition.targetWater} L
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (nutrition.water / nutrition.targetWater) * 100)} 
                    className="h-3 mb-4 bg-muted border border-cyan-400/20" 
                  />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-green-500/30 hover:bg-green-500/10" 
                      onClick={() => addNutrition('water', 0.25)}
                    >
                      +0.25L
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-green-500/30 hover:bg-green-500/10" 
                      onClick={() => addNutrition('water', 0.5)}
                    >
                      +0.5L
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-green-500/30 hover:bg-green-500/10" 
                      onClick={() => addNutrition('water', 1)}
                    >
                      +1L
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-red-500/30 hover:bg-red-500/10" 
                      onClick={() => subtractNutrition('water', 0.25)}
                    >
                      -0.25L
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-red-500/30 hover:bg-red-500/10" 
                      onClick={() => subtractNutrition('water', 0.5)}
                    >
                      -0.5L
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-red-500/30 hover:bg-red-500/10" 
                      onClick={() => subtractNutrition('water', 1)}
                    >
                      -1L
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="glass-card card-hover animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
            Kalender Navigation
          </CardTitle>
          <CardDescription>Klicke auf ein Datum, um Details zu sehen</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-lg pointer-events-auto glass-card border border-purple-400/20"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Habits;
