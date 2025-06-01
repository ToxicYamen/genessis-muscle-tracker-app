
import { useState } from "react";
import { motion } from "framer-motion";
import { useTrackingData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { storageService } from "@/services/storageService";
import { Calendar, Edit2, Plus, Save, Trash2, X, Dumbbell, Apple, Pill } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Workout = () => {
  const { workoutSplit } = useTrackingData();
  const [workoutData, setWorkoutData] = useState(storageService.getWorkoutData());
  const [editMode, setEditMode] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  
  // Get the current day of the week
  const today = new Date().getDay();
  const todayWorkoutIndex = today === 0 ? -1 : today - 1;
  const todayWorkout = todayWorkoutIndex >= 0 && todayWorkoutIndex < workoutData.days.length ? 
    workoutData.days[todayWorkoutIndex].name : "Sonntag";

  const saveWorkoutData = () => {
    storageService.saveWorkoutData(workoutData);
    setEditMode(false);
    setEditingDay(null);
    toast({
      title: "Trainingsplan gespeichert",
      description: "Deine Änderungen wurden erfolgreich gespeichert.",
    });
  };

  const addExercise = (dayName: string) => {
    setWorkoutData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.name === dayName 
          ? { ...day, exercises: [...day.exercises, "Neue Übung 3x10"] }
          : day
      )
    }));
  };

  const removeExercise = (dayName: string, exerciseIndex: number) => {
    setWorkoutData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.name === dayName 
          ? { ...day, exercises: day.exercises.filter((_, i) => i !== exerciseIndex) }
          : day
      )
    }));
  };

  const updateExercise = (dayName: string, exerciseIndex: number, newExercise: string) => {
    setWorkoutData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.name === dayName 
          ? { 
              ...day, 
              exercises: day.exercises.map((ex, i) => i === exerciseIndex ? newExercise : ex)
            }
          : day
      )
    }));
  };

  const updateDayFocus = (dayName: string, newFocus: string) => {
    setWorkoutData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.name === dayName ? { ...day, focus: newFocus } : day
      )
    }));
  };

  const toggleRestDay = (dayName: string) => {
    setWorkoutData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.name === dayName ? { ...day, isRestDay: !day.isRestDay } : day
      )
    }));
  };

  const nutrition = storageService.getNutrition(new Date().toISOString().split('T')[0]);
  const supplements = storageService.getSupplements();
  const todaysTaken = supplements.filter(s => s.taken[new Date().toISOString().split('T')[0]]).length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold">{workoutData.splitName}</h2>
          {editMode && (
            <Input
              value={workoutData.splitName}
              onChange={(e) => setWorkoutData(prev => ({ ...prev, splitName: e.target.value }))}
              className="mt-2 text-2xl font-bold"
              placeholder="Split Name"
            />
          )}
        </div>
        <div className="flex items-center gap-3">
          <Card className="overflow-hidden bg-gradient-to-br from-blue-700/90 to-purple-800/90 text-white border-0 shadow-lg flex items-center">
            <CardContent className="p-3 flex items-center">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-white/10">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="pr-2">
                  <div className="text-xs font-medium text-blue-100">Heute:</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {todayWorkout || 'Kein Training'}
                    </span>
                    {todayWorkoutIndex >= 0 && todayWorkoutIndex < workoutData.days.length && !workoutData.days[todayWorkoutIndex].isRestDay && (
                      <Badge variant="secondary" className="h-5 text-xs bg-white/20 hover:bg-white/30 text-white border-0">
                        {workoutData.days[todayWorkoutIndex].focus}
                      </Badge>
                    )}
                    {(todayWorkoutIndex === -1 || (todayWorkoutIndex < workoutData.days.length && workoutData.days[todayWorkoutIndex].isRestDay)) && (
                      <Badge variant="secondary" className="h-5 text-xs bg-amber-500/20 text-amber-300 border-amber-400/30 hover:bg-amber-500/30">
                        Ruhetag
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button
            onClick={editMode ? saveWorkoutData : () => setEditMode(true)}
            variant={editMode ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            {editMode ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {editMode ? "Speichern" : "Bearbeiten"}
          </Button>
          {editMode && (
            <Button
              onClick={() => {
                setEditMode(false);
                setEditingDay(null);
                setWorkoutData(storageService.getWorkoutData());
              }}
              variant="outline"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="w-5 h-5" />
                Heutige Ernährung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
                  <div className="text-2xl font-bold text-blue-400">{nutrition.calories}</div>
                  <div className="text-sm text-muted-foreground">/ {nutrition.targetCalories} kcal</div>
                </div>
                <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-800/30">
                  <div className="text-2xl font-bold text-green-400">{nutrition.protein}g</div>
                  <div className="text-sm text-muted-foreground">/ {nutrition.targetProtein}g Protein</div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full p-3 bg-card/50 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="text-2xl font-bold text-purple-400">{nutrition.water}ml</div>
                <div className="text-sm text-muted-foreground">/ {nutrition.targetWater}ml Wasser</div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Supplements heute
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-green-400">{todaysTaken}</div>
                <div className="text-sm text-muted-foreground">/ {supplements.length} eingenommen</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(todaysTaken / supplements.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Tabs defaultValue={workoutData.days[0]?.name} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
              {workoutData.days.map((day) => (
                <TabsTrigger key={day.name} value={day.name} className="text-xs">
                  {day.name}
                  {day.isRestDay && <Badge variant="secondary" className="ml-1 text-xs">R</Badge>}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {workoutData.days.map((day, dayIndex) => (
              <TabsContent key={day.name} value={day.name} className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="flex items-center gap-2">
                          <Dumbbell className="w-5 h-5" />
                          {day.name}
                        </CardTitle>
                        {editMode && (
                          <Button
                            size="sm"
                            variant={day.isRestDay ? "default" : "outline"}
                            onClick={() => toggleRestDay(day.name)}
                          >
                            {day.isRestDay ? "Ruhetag" : "Trainingstag"}
                          </Button>
                        )}
                      </div>
                      {editMode && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addExercise(day.name)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {editMode ? (
                      <Input
                        value={day.focus}
                        onChange={(e) => updateDayFocus(day.name, e.target.value)}
                        placeholder="Fokus des Trainingstages"
                      />
                    ) : (
                      <p className="text-muted-foreground">{day.focus}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {day.isRestDay ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-2">😴</div>
                        <p>Ruhetag - Zeit für Erholung!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {day.exercises.map((exercise, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="flex items-center gap-2 w-full"
                          >
                            {editMode ? (
                              <>
                                <Input
                                  value={exercise}
                                  onChange={(e) => updateExercise(day.name, index, e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeExercise(day.name, index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <div className="flex items-center gap-3 w-full p-3 bg-card/50 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="flex-1">{exercise}</span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Workout;
