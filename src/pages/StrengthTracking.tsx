import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { TrendingUp, PlusIcon, EditIcon, TrashIcon, Dumbbell } from "lucide-react";
import { supabaseStorageService } from "@/services/supabaseStorageService";
import { toast } from "@/components/ui/use-toast";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface Exercise {
  id: string;
  name: string;
  naturalTarget: number;
  enhancedTarget: number;
}

interface StrengthRecord {
  id: string;
  date: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
}

const StrengthTracking = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [strengthData, setStrengthData] = useState<StrengthRecord[]>([]);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();
  
  const [newEntry, setNewEntry] = useState({
    sets: "",
    reps: "",
    weight: "",
    notes: ""
  });

  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    naturalTarget: "",
    enhancedTarget: ""
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load default exercises or from localStorage for backwards compatibility
      const defaultExercises: Exercise[] = [
        { id: "bench", name: "Bankdrücken", naturalTarget: 140, enhancedTarget: 180 },
        { id: "squat", name: "Kniebeugen", naturalTarget: 180, enhancedTarget: 220 },
        { id: "deadlift", name: "Kreuzheben", naturalTarget: 200, enhancedTarget: 250 },
        { id: "pullup", name: "Klimmzüge", naturalTarget: 15, enhancedTarget: 20 },
        { id: "ohp", name: "Schulterdrücken", naturalTarget: 80, enhancedTarget: 100 }
      ];

      const stored = localStorage.getItem('strength_exercises');
      const loadedExercises = stored ? JSON.parse(stored) : defaultExercises;
      
      setExercises(loadedExercises);
      if (loadedExercises.length > 0 && !selectedExercise) {
        setSelectedExercise(loadedExercises[0].id);
      }

      // Load strength records from Supabase
      const strengthRecords = await supabaseStorageService.getStrengthRecords();
      const formattedRecords = strengthRecords.map(record => ({
        id: record.id!,
        date: record.date,
        exercise: record.exercise,
        sets: record.sets,
        reps: record.reps,
        weight: record.weight,
        notes: record.notes
      }));
      
      setStrengthData(formattedRecords);
    } catch (error) {
      console.error('Error loading strength data:', error);
      toast({
        title: "Fehler",
        description: "Kraftdaten konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveExercises = (exerciseList: Exercise[]) => {
    localStorage.setItem('strength_exercises', JSON.stringify(exerciseList));
    setExercises(exerciseList);
  };

  const addStrengthEntry = async () => {
    if (!selectedExercise || !newEntry.weight || !newEntry.sets || !newEntry.reps) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Pflichtfelder aus.",
        variant: "destructive"
      });
      return;
    }

    const exercise = exercises.find(e => e.id === selectedExercise);
    if (!exercise) return;

    try {
      const entry = {
        date: format(new Date(), "yyyy-MM-dd"),
        exercise: exercise.name,
        sets: parseInt(newEntry.sets),
        reps: parseInt(newEntry.reps),
        weight: parseFloat(newEntry.weight),
        notes: newEntry.notes || undefined
      };

      await supabaseStorageService.saveStrengthRecords([entry]);
      await loadData();

      setNewEntry({ sets: "", reps: "", weight: "", notes: "" });
      setIsEntryDialogOpen(false);

      toast({
        title: "Krafttraining eingetragen",
        description: `${exercise.name}: ${entry.sets}x${entry.reps} @ ${entry.weight}kg`,
      });
    } catch (error) {
      console.error('Error saving strength entry:', error);
      toast({
        title: "Fehler",
        description: "Krafteintrag konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const addOrUpdateExercise = () => {
    if (!exerciseForm.name || !exerciseForm.naturalTarget || !exerciseForm.enhancedTarget) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Felder aus.",
        variant: "destructive"
      });
      return;
    }

    const newExercise: Exercise = {
      id: editingExercise?.id || `exercise_${Date.now()}`,
      name: exerciseForm.name,
      naturalTarget: parseFloat(exerciseForm.naturalTarget),
      enhancedTarget: parseFloat(exerciseForm.enhancedTarget)
    };

    let updatedExercises;
    if (editingExercise) {
      updatedExercises = exercises.map(ex => ex.id === editingExercise.id ? newExercise : ex);
    } else {
      updatedExercises = [...exercises, newExercise];
    }

    saveExercises(updatedExercises);
    
    setExerciseForm({ name: "", naturalTarget: "", enhancedTarget: "" });
    setEditingExercise(null);
    setIsExerciseDialogOpen(false);

    toast({
      title: editingExercise ? "Übung aktualisiert" : "Übung hinzugefügt",
      description: `${newExercise.name} wurde erfolgreich ${editingExercise ? 'aktualisiert' : 'hinzugefügt'}.`,
    });
  };

  const deleteExercise = (exerciseId: string) => {
    const updatedExercises = exercises.filter(ex => ex.id !== exerciseId);
    saveExercises(updatedExercises);
    
    if (selectedExercise === exerciseId && updatedExercises.length > 0) {
      setSelectedExercise(updatedExercises[0].id);
    }

    toast({
      title: "Übung gelöscht",
      description: "Die Übung wurde erfolgreich entfernt.",
    });
  };

  const startEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setExerciseForm({
      name: exercise.name,
      naturalTarget: exercise.naturalTarget.toString(),
      enhancedTarget: exercise.enhancedTarget.toString()
    });
    setIsExerciseDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Bitte melde dich an, um deine Kraftdaten zu sehen.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Lade Kraftdaten...</p>
      </div>
    );
  }

  // Chart data for selected exercise
  const selectedExerciseData = exercises.find(e => e.id === selectedExercise);
  const exerciseEntries = strengthData.filter(entry => 
    selectedExerciseData && entry.exercise === selectedExerciseData.name
  );

  const chartData = exerciseEntries.map(entry => ({
    date: format(parseISO(entry.date), "dd.MM"),
    weight: entry.weight,
    volume: entry.sets * entry.reps * entry.weight
  }));

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-card border-r border-border p-4 space-y-2"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Kraftentwicklung</h3>
          <div className="flex gap-1">
            <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 w-8" variant="outline" title="Neuer Eintrag">
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Neuer Krafteintrag</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-sm font-medium">
                    Übung: {selectedExerciseData?.name}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sets">Sätze</Label>
                      <Input
                        id="sets"
                        type="number"
                        value={newEntry.sets}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, sets: e.target.value }))}
                        placeholder="z.B. 4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reps">Wdh.</Label>
                      <Input
                        id="reps"
                        type="number"
                        value={newEntry.reps}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, reps: e.target.value }))}
                        placeholder="z.B. 8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Gewicht (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.5"
                        value={newEntry.weight}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, weight: e.target.value }))}
                        placeholder="z.B. 80"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notizen (optional)</Label>
                    <Input
                      id="notes"
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="z.B. Gefühl war gut"
                    />
                  </div>
                  <Button onClick={addStrengthEntry} className="w-full">
                    Eintrag speichern
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isExerciseDialogOpen} onOpenChange={(open) => {
              setIsExerciseDialogOpen(open);
              if (!open) {
                setEditingExercise(null);
                setExerciseForm({ name: "", naturalTarget: "", enhancedTarget: "" });
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 w-8" variant="outline" title="Übung hinzufügen">
                  <EditIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingExercise ? "Übung bearbeiten" : "Neue Übung"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="exerciseName">Übungsname</Label>
                    <Input
                      id="exerciseName"
                      value={exerciseForm.name}
                      onChange={(e) => setExerciseForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="z.B. Bankdrücken"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="naturalTarget">Natural Ziel (kg)</Label>
                      <Input
                        id="naturalTarget"
                        type="number"
                        value={exerciseForm.naturalTarget}
                        onChange={(e) => setExerciseForm(prev => ({ ...prev, naturalTarget: e.target.value }))}
                        placeholder="z.B. 140"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="enhancedTarget">Enhanced Ziel (kg)</Label>
                      <Input
                        id="enhancedTarget"
                        type="number"
                        value={exerciseForm.enhancedTarget}
                        onChange={(e) => setExerciseForm(prev => ({ ...prev, enhancedTarget: e.target.value }))}
                        placeholder="z.B. 180"
                      />
                    </div>
                  </div>
                  <Button onClick={addOrUpdateExercise} className="w-full">
                    {editingExercise ? "Übung aktualisieren" : "Übung hinzufügen"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {exercises.map((exercise) => (
          <div key={exercise.id} className="flex items-center gap-2">
            <Button
              variant={selectedExercise === exercise.id ? "default" : "ghost"}
              className="flex-1 justify-start text-left"
              onClick={() => setSelectedExercise(exercise.id)}
            >
              {exercise.name}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => startEditExercise(exercise)}
            >
              <EditIcon className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              onClick={() => deleteExercise(exercise.id)}
            >
              <TrashIcon className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold">Kraftentwicklung</h2>
          <p className="text-muted-foreground">Verfolge deine Kraftsteigerung bei verschiedenen Übungen</p>
        </motion.div>

        {selectedExerciseData && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-primary" />
                    Aktuelles Max
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {exerciseEntries.length > 0 ? Math.max(...exerciseEntries.map(e => e.weight)) : 0} kg
                  </div>
                  <p className="text-xs text-muted-foreground">Höchstes Gewicht</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Natural Ziel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    {selectedExerciseData.naturalTarget} kg
                  </div>
                  <p className="text-xs text-muted-foreground">Natürliches Limit</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Enhanced Ziel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">
                    {selectedExerciseData.enhancedTarget} kg
                  </div>
                  <p className="text-xs text-muted-foreground">Enhanced Limit</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Einträge</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-400">
                    {exerciseEntries.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Trainingseinheiten</p>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Kraftentwicklung: {selectedExerciseData.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
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
                          strokeWidth={3}
                          fill="url(#colorWeight)"
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">Keine Daten verfügbar</p>
                        <p className="text-sm text-muted-foreground">Füge deinen ersten Krafteintrag hinzu</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Entries */}
            {exerciseEntries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Letzte Einträge</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {exerciseEntries.slice(-5).reverse().map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            {format(new Date(entry.date), "dd.MM.yyyy", { locale: de })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.sets}x{entry.reps} @ {entry.weight}kg
                            {entry.notes && ` • ${entry.notes}`}
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          Vol: {(entry.sets * entry.reps * entry.weight).toFixed(0)}kg
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StrengthTracking;
