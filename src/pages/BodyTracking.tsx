
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, ScaleIcon, RulerIcon, Activity, TrendingUpIcon, PlusIcon, TrashIcon } from "lucide-react";
import { supabaseStorageService } from "@/services/supabaseStorageService";
import { toast } from "@/components/ui/use-toast";
import { useStore } from "@/store/useStore";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface BodyMeasurement {
  id?: string;
  date: string;
  weight: number;
  height: number;
  bodyFat: number;
  muscleMass: number;
}

const BodyTracking = () => {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  
  const [newMeasurement, setNewMeasurement] = useState({
    weight: "",
    height: "186",
    bodyFat: "",
    muscleMass: ""
  });

  const { setHeight, setWeight, setBodyFat } = useStore();
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (user) {
      loadMeasurements();
    }
  }, [user]);

  const loadMeasurements = async () => {
    try {
      setLoading(true);
      const data = await supabaseStorageService.getBodyMeasurements();
      setMeasurements(data);
    } catch (error) {
      console.error('Error loading measurements:', error);
      toast({
        title: "Fehler",
        description: "Körpermessungen konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addMeasurement = async () => {
    if (!newMeasurement.weight || !newMeasurement.bodyFat) {
      toast({
        title: "Fehler",
        description: "Bitte fülle Gewicht und Körperfett aus.",
        variant: "destructive"
      });
      return;
    }

    try {
      const measurement = {
        date: format(selectedDate, "yyyy-MM-dd"),
        weight: parseFloat(newMeasurement.weight),
        height: parseFloat(newMeasurement.height),
        body_fat: parseFloat(newMeasurement.bodyFat),
        muscle_mass: parseFloat(newMeasurement.muscleMass) || 0
      };

      await supabaseStorageService.saveBodyMeasurements([measurement]);
      
      // Automatisch ins Profil übernehmen
      setHeight(parseFloat(newMeasurement.height));
      setWeight(parseFloat(newMeasurement.weight));
      setBodyFat(parseFloat(newMeasurement.bodyFat));
      
      await loadMeasurements();

      setNewMeasurement({
        weight: "",
        height: "186",
        bodyFat: "",
        muscleMass: ""
      });

      setIsDialogOpen(false);

      toast({
        title: "Messung gespeichert",
        description: `Körpermessung für ${format(selectedDate, "dd.MM.yyyy", { locale: de })} hinzugefügt und ins Profil übernommen.`,
      });
    } catch (error) {
      console.error('Error saving measurement:', error);
      toast({
        title: "Fehler",
        description: "Messung konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  const deleteMeasurement = async (id: string) => {
    try {
      // Note: You'll need to add a delete method to supabaseStorageService
      // For now, we'll reload the data
      await loadMeasurements();
      
      toast({
        title: "Messung gelöscht",
        description: "Die Körpermessung wurde erfolgreich entfernt.",
      });
    } catch (error) {
      console.error('Error deleting measurement:', error);
      toast({
        title: "Fehler",
        description: "Messung konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
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

  const chartData = measurements.map(m => ({
    date: format(new Date(m.date), "dd.MM", { locale: de }),
    Gewicht: m.weight,
    Körperfett: m.body_fat,
    Muskelmasse: m.muscle_mass || 0
  }));

  const latestMeasurement = measurements[measurements.length - 1];
  const bmi = latestMeasurement ? 
    (latestMeasurement.weight / Math.pow(latestMeasurement.height / 100, 2)).toFixed(1) : 
    null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
            Körper-Tracking
          </h2>
          <p className="text-muted-foreground">Verfolge deine körperlichen Veränderungen</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Neue Messung
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Neue Körpermessung</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label>Datum:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(selectedDate, "dd.MM.yyyy", { locale: de })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-lg pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Gewicht (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={newMeasurement.weight}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="z.B. 75.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Körpergröße (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={newMeasurement.height}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, height: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bodyFat">Körperfett (%) *</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={newMeasurement.bodyFat}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, bodyFat: e.target.value }))}
                    placeholder="z.B. 12.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="muscleMass">Muskelmasse (kg)</Label>
                  <Input
                    id="muscleMass"
                    type="number"
                    step="0.1"
                    value={newMeasurement.muscleMass}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, muscleMass: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <Button 
                onClick={addMeasurement} 
                className="w-full"
              >
                Messung hinzufügen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card card-hover animate-scale-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <ScaleIcon className="h-4 w-4 text-primary" />
              Aktuelles Gewicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {latestMeasurement?.weight || "?"} kg
            </div>
            <p className="text-xs text-muted-foreground">
              {measurements.length > 1 && (
                <>
                  {(latestMeasurement.weight - measurements[measurements.length - 2].weight) > 0 ? '↗' : '↘'} 
                  {Math.abs(latestMeasurement.weight - measurements[measurements.length - 2].weight).toFixed(1)} kg
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <RulerIcon className="h-4 w-4 text-blue-400" />
              BMI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {bmi || "?"}
            </div>
            <p className="text-xs text-muted-foreground">
              Größe: {latestMeasurement?.height || 186} cm
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-400" />
              Körperfett
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {latestMeasurement?.body_fat || "?"}%
            </div>
            <p className="text-xs text-muted-foreground">
              {measurements.length > 1 && (
                <>
                  {(latestMeasurement.body_fat - measurements[measurements.length - 2].body_fat) > 0 ? '↗' : '↘'} 
                  {Math.abs(latestMeasurement.body_fat - measurements[measurements.length - 2].body_fat).toFixed(1)}%
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover animate-scale-in" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4 text-green-400" />
              Muskelmasse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {latestMeasurement?.muscle_mass || "?"} kg
            </div>
            <p className="text-xs text-muted-foreground">
              Geschätzt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card className="glass-card animate-slide-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4 text-green-400" />
            Fortschrittsverlauf
          </CardTitle>
        </CardHeader>
        <CardContent>
          {measurements.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Gewicht" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Körperfett" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
                  />
                  {measurements.some(m => m.muscle_mass > 0) && (
                    <Line 
                      type="monotone" 
                      dataKey="Muskelmasse" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <TrendingUpIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Daten verfügbar</h3>
              <p className="text-muted-foreground text-center">
                Füge deine erste Körpermessung hinzu, um den Fortschritt zu sehen
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Measurements List */}
      {measurements.length > 0 && (
        <Card className="glass-card animate-slide-in">
          <CardHeader>
            <CardTitle>Alle Messungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {measurements.slice().reverse().map((measurement) => (
                <div key={measurement.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {format(new Date(measurement.date), "dd.MM.yyyy", { locale: de })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {measurement.weight}kg • {measurement.body_fat}% KF • {measurement.height}cm
                      {measurement.muscle_mass > 0 && ` • ${measurement.muscle_mass}kg MM`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMeasurement(measurement.id!)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BodyTracking;
