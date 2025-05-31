
import { useState } from "react";
import { useTrackingData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ScaleIcon, RulerIcon, Activity, TrendingUpIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface BodyMeasurement {
  date: string;
  weight: number;
  height: number;
  bodyFat: number;
  muscleMass: number;
}

const BodyTracking = () => {
  const { personalData } = useTrackingData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([
    {
      date: "2025-01-15",
      weight: 75,
      height: 186,
      bodyFat: 12,
      muscleMass: 45
    }
  ]);
  
  const [newMeasurement, setNewMeasurement] = useState({
    weight: "",
    height: "186",
    bodyFat: "",
    muscleMass: ""
  });

  const addMeasurement = () => {
    if (!newMeasurement.weight || !newMeasurement.bodyFat) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle erforderlichen Felder aus.",
        variant: "destructive"
      });
      return;
    }

    const measurement: BodyMeasurement = {
      date: format(selectedDate, "yyyy-MM-dd"),
      weight: parseFloat(newMeasurement.weight),
      height: parseFloat(newMeasurement.height),
      bodyFat: parseFloat(newMeasurement.bodyFat),
      muscleMass: parseFloat(newMeasurement.muscleMass) || 0
    };

    setMeasurements(prev => [...prev, measurement].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));

    setNewMeasurement({
      weight: "",
      height: "186",
      bodyFat: "",
      muscleMass: ""
    });

    toast({
      title: "Messung hinzugefügt",
      description: `Neue Körpermessung für ${format(selectedDate, "dd.MM.yyyy")} gespeichert.`,
    });
  };

  const chartData = measurements.map(m => ({
    date: format(new Date(m.date), "MMM dd"),
    Gewicht: m.weight,
    Körperfett: m.bodyFat,
    Muskelmasse: m.muscleMass
  }));

  const latestMeasurement = measurements[measurements.length - 1];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Körper-Tracking</h2>
          <p className="text-muted-foreground">Verfolge deine körperlichen Veränderungen</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-lg">
          <TabsTrigger value="overview" className="rounded-lg">
            <Activity className="h-4 w-4 mr-2" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="add" className="rounded-lg">
            <ScaleIcon className="h-4 w-4 mr-2" />
            Neue Messung
          </TabsTrigger>
          <TabsTrigger value="progress" className="rounded-lg">
            <TrendingUpIcon className="h-4 w-4 mr-2" />
            Fortschritt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-md card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <ScaleIcon className="h-4 w-4" />
                  Aktuelles Gewicht
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestMeasurement?.weight || "?"} kg</div>
                <p className="text-xs text-muted-foreground">
                  Ziel: {personalData.weight} kg
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <RulerIcon className="h-4 w-4" />
                  Körpergröße
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestMeasurement?.height || 186} cm</div>
                <p className="text-xs text-muted-foreground">
                  BMI: {latestMeasurement ? ((latestMeasurement.weight / Math.pow(latestMeasurement.height / 100, 2)).toFixed(1)) : "?"}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Körperfett
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestMeasurement?.bodyFat || "?"}%</div>
                <p className="text-xs text-muted-foreground">
                  Ziel: {personalData.bodyFat}%
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4" />
                  Muskelmasse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestMeasurement?.muscleMass || "?"} kg</div>
                <p className="text-xs text-muted-foreground">
                  Geschätzt
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Neue Körpermessung hinzufügen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Label>Datum:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="rounded-lg">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(selectedDate, "dd.MM.yyyy")}
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
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Körpergröße (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={newMeasurement.height}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, height: e.target.value }))}
                    className="rounded-lg"
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
                    className="rounded-lg"
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
                    className="rounded-lg"
                  />
                </div>
              </div>

              <Button onClick={addMeasurement} className="w-full rounded-lg">
                Messung hinzufügen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Fortschrittsverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Gewicht" stroke="#ffffff" strokeWidth={2} />
                    <Line type="monotone" dataKey="Körperfett" stroke="#888888" strokeWidth={2} />
                    <Line type="monotone" dataKey="Muskelmasse" stroke="#444444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BodyTracking;
