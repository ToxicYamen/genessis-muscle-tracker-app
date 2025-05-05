
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format, startOfWeek, addDays } from "date-fns";
import { CalendarIcon, DropletIcon, CircleCheckIcon, ProteinIcon, WaterIcon, PlusIcon } from "lucide-react";

// Sample habit data
const habits = [
  {
    id: 1,
    name: "Protein Shake",
    icon: <ProteinIcon className="h-5 w-5" />,
    target: 2,
    completed: 2,
    streak: 7,
    days: {
      "2025-07-01": 2,
      "2025-07-02": 2,
      "2025-07-03": 2,
      "2025-07-04": 1,
      "2025-07-05": 2,
    }
  },
  {
    id: 2,
    name: "Wasser (2L)",
    icon: <WaterIcon className="h-5 w-5" />,
    target: 4,
    completed: 3,
    streak: 5,
    days: {
      "2025-07-01": 4,
      "2025-07-02": 4,
      "2025-07-03": 3,
      "2025-07-04": 4,
      "2025-07-05": 3,
    }
  },
  {
    id: 3,
    name: "Kreatin",
    icon: <DropletIcon className="h-5 w-5" />,
    target: 1,
    completed: 1,
    streak: 14,
    days: {
      "2025-07-01": 1,
      "2025-07-02": 1,
      "2025-07-03": 1,
      "2025-07-04": 1,
      "2025-07-05": 1,
    }
  },
  {
    id: 4,
    name: "Multivitamin",
    icon: <CircleCheckIcon className="h-5 w-5" />,
    target: 1,
    completed: 0,
    streak: 0,
    days: {
      "2025-07-01": 1,
      "2025-07-02": 1,
      "2025-07-03": 1,
      "2025-07-04": 0,
      "2025-07-05": 0,
    }
  },
];

// Nutrition tracking data
const nutritionData = [
  {
    id: 1,
    date: "2025-07-05",
    calories: 4500,
    target: 4864,
    protein: 260,
    targetProtein: 280,
    water: 4.2,
    targetWater: 5,
  },
  {
    id: 2,
    date: "2025-07-04",
    calories: 4750,
    target: 4864,
    protein: 275,
    targetProtein: 280,
    water: 4.5,
    targetWater: 5,
  },
];

const Habits = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  
  // Get today's nutrition data
  const todayNutrition = nutritionData.find(n => n.date === formattedDate) || nutritionData[0];
  
  // Calculate week days for display
  const weekStartDate = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStartDate, i));
  
  // Function to increment habit count
  const incrementHabit = (habitId: number) => {
    // Would update habit tracking in a real app
    console.log(`Increment habit: ${habitId} on ${formattedDate}`);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Habit Tracker</h2>
          <p className="text-muted-foreground">Verfolge deine täglichen Habits und Ernährung</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2 rounded-full">
            <CalendarIcon className="h-4 w-4" />
            {format(selectedDate, "EEEE, dd.MM.yyyy", { locale: require("date-fns/locale/de") })}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md animate-slide-in card-hover">
          <CardHeader className="pb-3">
            <CardTitle>Tägliche Habits</CardTitle>
            <CardDescription>Ergänzungen und Routinen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {habits.map(habit => {
                const completion = Math.round((habit.completed / habit.target) * 100);
                const dateKey = format(selectedDate, "yyyy-MM-dd");
                const todayCompleted = habit.days[dateKey] || 0;
                const todayCompletion = Math.round((todayCompleted / habit.target) * 100);
                
                return (
                  <div key={habit.id} className="bg-accent/50 rounded-xl p-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-background rounded-full p-2">
                          {habit.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{habit.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {todayCompleted} von {habit.target} • Streak: {habit.streak} Tage
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => incrementHabit(habit.id)}
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        disabled={todayCompleted >= habit.target}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span>Heute</span>
                        <span>{todayCompletion}%</span>
                      </div>
                      <Progress value={todayCompletion} className="h-2" />
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      {weekDays.map((day, i) => {
                        const dayKey = format(day, "yyyy-MM-dd");
                        const completed = habit.days[dayKey] || 0;
                        const percentage = Math.round((completed / habit.target) * 100);
                        const isToday = dayKey === format(new Date(), "yyyy-MM-dd");
                        
                        return (
                          <div key={i} className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground mb-1">
                              {format(day, "E", { locale: require("date-fns/locale/de") })}
                            </span>
                            <div 
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs
                                ${completed >= habit.target 
                                  ? "bg-primary text-primary-foreground" 
                                  : completed > 0 
                                    ? "bg-accent border border-primary/30" 
                                    : "bg-accent"}
                                ${isToday ? "ring-2 ring-primary" : ""}
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
              
              <Button variant="outline" className="w-full rounded-xl">
                <PlusIcon className="h-4 w-4 mr-2" />
                Neuer Habit
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md animate-slide-in card-hover">
          <CardHeader className="pb-3">
            <CardTitle>Ernährungstracker</CardTitle>
            <CardDescription>Kalorien, Protein und Wasser für {format(selectedDate, "dd.MM.yyyy")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-accent/50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Kalorien</h3>
                  <span className="text-sm">{todayNutrition.calories} / {todayNutrition.target} kcal</span>
                </div>
                <Progress 
                  value={Math.min(100, (todayNutrition.calories / todayNutrition.target) * 100)} 
                  className="h-2.5 mt-2" 
                />
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => console.log("+200 kcal")}>+200</Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => console.log("+500 kcal")}>+500</Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => console.log("+1000 kcal")}>+1000</Button>
                </div>
              </div>
              
              <div className="bg-accent/50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Protein</h3>
                  <span className="text-sm">{todayNutrition.protein} / {todayNutrition.targetProtein} g</span>
                </div>
                <Progress 
                  value={Math.min(100, (todayNutrition.protein / todayNutrition.targetProtein) * 100)} 
                  className="h-2.5 mt-2" 
                />
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => console.log("+10g Protein")}>+10g</Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => console.log("+25g Protein")}>+25g</Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => console.log("+50g Protein")}>+50g</Button>
                </div>
              </div>
              
              <div className="bg-accent/50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Wasser</h3>
                  <span className="text-sm">{todayNutrition.water} / {todayNutrition.targetWater} L</span>
                </div>
                <Progress 
                  value={Math.min(100, (todayNutrition.water / todayNutrition.targetWater) * 100)} 
                  className="h-2.5 mt-2" 
                />
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => console.log("+0.25L Wasser")}>+0.25L</Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => console.log("+0.5L Wasser")}>+0.5L</Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => console.log("+1L Wasser")}>+1L</Button>
                </div>
              </div>
              
              <Button variant="outline" className="w-full rounded-xl">
                Ernährungsdaten bearbeiten
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-md animate-fade-in card-hover">
        <CardHeader>
          <CardTitle>Monatliche Übersicht</CardTitle>
          <CardDescription>Klicke auf ein Datum, um Details zu sehen</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md pointer-events-auto"
            modifiersStyles={{
              selected: { backgroundColor: "black", color: "white" },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Habits;
