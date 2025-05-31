
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, ScaleIcon, RulerIcon, Activity, TrendingUpIcon } from "lucide-react";
import { storageService, BodyMeasurement } from "@/services/storageService";
import { toast } from "@/components/ui/use-toast";

const BodyTracking = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  
  const [newMeasurement, setNewMeasurement] = useState({
    weight: "",
    height: "186",
    bodyFat: "",
    muscleMass: ""
  });

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = () => {
    const data = storageService.getBodyMeasurements();
    setMeasurements(data);
  };

  const addMeasurement = () => {
    if (!newMeasurement.weight || !newMeasurement.bodyFat) {
      toast({
        title: "Fehler",
        description: "Bitte fülle Gewicht und Körperfett aus.",
        variant: "destructive"
      });
      return;
    }

    const measurement: BodyMeasurement = {
      id: `measurement_${Date.now()}`,
      date: format(selectedDate, "yyyy-MM-dd"),
      weight: parseFloat(newMeasurement.weight),
      height: parseFloat(newMeasurement.height),
      bodyFat: parseFloat(newMeasurement.bodyFat),
      muscleMass: parseFloat(newMeasurement.muscleMass) || 0
    };

    storageService.saveBodyMeasurement(measurement);
    loadMeasurements();

    setNewMeasurement({
      weight: "",
      height: "186",
      bodyFat: "",
      muscleMass: ""
    });

    toast({
      title: "Messung gespeichert",
      description: `Körpermessung für ${format(selectedDate, "dd.MM.yyyy", { locale: de })} hinzugefügt.`,
    });
  };

  const chartData = measurements.map(m => ({
    date: format(new Date(m.date), "dd.MM", { locale: de }),
    Gewicht: m.weight,
    Körperfett: m.bodyFat,
    Muskelmasse: m.muscleMass || 0
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
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-lg glass-card">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-primary/20">
            <Activity className="h-4 w-4 mr-2" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="add" className="rounded-lg data-[state=active]:bg-primary/20">
            <ScaleIcon className="h-4 w-4 mr-2" />
            Neue Messung
          </TabsTrigger>
          <TabsTrigger value="progress" className="rounded-lg data-[state=active]:bg-primary/20">
            <TrendingUpIcon className="h-4 w-4 mr-2" />
            Fortschritt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
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
                  {latestMeasurement?.bodyFat || "?"}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {measurements.length > 1 && (
                    <>
                      {(latestMeasurement.bodyFat - measurements[measurements.length - 2].bodyFat) > 0 ? '↗' : '↘'} 
                      {Math.abs(latestMeasurement.bodyFat - measurements[measurements.length - 2].bodyFat).toFixed(1)}%
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
                  {latestMeasurement?.muscleMass || "?"} kg
                </div>
                <p className="text-xs text-muted-foreground">
                  Geschätzt
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <Card className="glass-card animate-slide-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                Neue Körpermessung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Label>Datum:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="rounded-lg glass-card border-primary/20">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(selectedDate, "dd.MM.yyyy", { locale: de })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass-card">
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
                  <Label htmlFor="weight" className="text-primary">Gewicht (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={newMeasurement.weight}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, weight: e.target.value }))}
                    className="glass-card border-primary/20"
                    placeholder="z.B. 75.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="text-blue-400">Körpergröße (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={newMeasurement.height}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, height: e.target.value }))}
                    className="glass-card border-blue-400/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bodyFat" className="text-orange-400">Körperfett (%) *</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={newMeasurement.bodyFat}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, bodyFat: e.target.value }))}
                    className="glass-card border-orange-400/20"
                    placeholder="z.B. 12.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="muscleMass" className="text-green-400">Muskelmasse (kg)</Label>
                  <Input
                    id="muscleMass"
                    type="number"
                    step="0.1"
                    value={newMeasurement.muscleMass}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, muscleMass: e.target.value }))}
                    className="glass-card border-green-400/20"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <Button 
                onClick={addMeasurement} 
                className="w-full rounded-lg bg-primary/20 border border-primary/30 hover:bg-primary/30"
              >
                Messung hinzufügen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <Card className="glass-card animate-slide-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
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
                      {measurements.some(m => m.muscleMass > 0) && (
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BodyTracking;
