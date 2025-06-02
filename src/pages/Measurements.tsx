
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { supabaseStorageService } from "@/services/supabaseStorageService";
import { toast } from "@/components/ui/use-toast";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface MeasurementData {
  id?: string;
  date: string;
  chest: number;
  waist: number;
  hips: number;
  armumfang: number;
  thigh: number;
  neck: number;
  shoulders: number;
  forearm: number;
}

const Measurements = () => {
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [activeTab, setActiveTab] = useState("chest");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();
  
  const [newMeasurement, setNewMeasurement] = useState<Partial<MeasurementData>>({
    date: format(new Date(), "yyyy-MM-dd"),
    chest: 0,
    waist: 0,
    hips: 0,
    armumfang: 0,
    thigh: 0,
    neck: 0,
    shoulders: 0,
    forearm: 0,
  });

  const measurementFields = [
    { key: "chest", label: "Brust", unit: "cm", color: "#ef4444" },
    { key: "waist", label: "Taille", unit: "cm", color: "#f97316" },
    { key: "hips", label: "Hüfte", unit: "cm", color: "#eab308" },
    { key: "armumfang", label: "Armumfang", unit: "cm", color: "#22c55e" },
    { key: "thigh", label: "Oberschenkel", unit: "cm", color: "#06b6d4" },
    { key: "neck", label: "Nacken", unit: "cm", color: "#8b5cf6" },
    { key: "shoulders", label: "Schultern", unit: "cm", color: "#ec4899" },
    { key: "forearm", label: "Unterarm", unit: "cm", color: "#10b981" },
  ];

  useEffect(() => {
    if (user) {
      loadMeasurements();
    }
  }, [user]);

  const loadMeasurements = async () => {
    try {
      setLoading(true);
      const data = await supabaseStorageService.getMeasurements();
      setMeasurements(data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (error) {
      console.error('Error loading measurements:', error);
      toast({
        title: "Fehler",
        description: "Messwerte konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMeasurement = async () => {
    if (!newMeasurement.date) {
      toast({
        title: "Fehler",
        description: "Bitte wähle ein Datum aus.",
        variant: "destructive",
      });
      return;
    }

    try {
      const measurementToSave = {
        ...newMeasurement,
        date: newMeasurement.date!,
      } as MeasurementData;

      await supabaseStorageService.saveMeasurements([measurementToSave]);
      await loadMeasurements();
      setIsDialogOpen(false);
      setNewMeasurement({
        date: format(new Date(), "yyyy-MM-dd"),
        chest: 0,
        waist: 0,
        hips: 0,
        armumfang: 0,
        thigh: 0,
        neck: 0,
        shoulders: 0,
        forearm: 0,
      });

      toast({
        title: "Messung gespeichert",
        description: "Deine Körpermaße wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      console.error('Error saving measurement:', error);
      toast({
        title: "Fehler",
        description: "Messung konnte nicht gespeichert werden.",
        variant: "destructive",
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

  const getChartData = (field: string) => {
    return measurements.map((measurement) => ({
      date: format(new Date(measurement.date), "dd.MM", { locale: de }),
      value: measurement[field as keyof MeasurementData] as number,
      fullDate: measurement.date
    }));
  };

  const getLatestValue = (field: string) => {
    if (measurements.length === 0) return 0;
    return measurements[measurements.length - 1][field as keyof MeasurementData] as number;
  };

  const getTrend = (field: string) => {
    if (measurements.length < 2) return 0;
    const latest = measurements[measurements.length - 1][field as keyof MeasurementData] as number;
    const previous = measurements[measurements.length - 2][field as keyof MeasurementData] as number;
    return latest - previous;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
            Messwerte
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">Verfolge deine Körpermaße und Fortschritte</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Neue Messung
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neue Messung hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Datum</Label>
                <Input
                  id="date"
                  type="date"
                  value={newMeasurement.date}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {measurementFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key} className="text-sm">{field.label}</Label>
                    <div className="relative">
                      <Input
                        id={field.key}
                        type="number"
                        step="0.1"
                        value={newMeasurement[field.key as keyof MeasurementData] || ""}
                        onChange={(e) => setNewMeasurement(prev => ({ 
                          ...prev, 
                          [field.key]: parseFloat(e.target.value) || 0 
                        }))}
                        className="pr-8"
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                        {field.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button onClick={saveMeasurement} className="w-full">
                Messung speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Top Navigation Tabs */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-border">
              <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 h-auto bg-transparent p-1">
                {measurementFields.map((field) => (
                  <TabsTrigger
                    key={field.key}
                    value={field.key}
                    className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md"
                  >
                    <span className="hidden sm:inline">{field.label}</span>
                    <span className="sm:hidden">{field.label.slice(0, 3)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {measurementFields.map((field) => (
              <TabsContent key={field.key} value={field.key} className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Statistics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card className="p-3 sm:p-4">
                      <div className="text-xs sm:text-sm text-muted-foreground">Aktuell</div>
                      <div className="text-lg sm:text-2xl font-bold" style={{ color: field.color }}>
                        {getLatestValue(field.key)} {field.unit}
                      </div>
                    </Card>
                    
                    <Card className="p-3 sm:p-4">
                      <div className="text-xs sm:text-sm text-muted-foreground">Trend</div>
                      <div className={`text-lg sm:text-2xl font-bold flex items-center gap-1 ${
                        getTrend(field.key) > 0 ? 'text-green-500' : getTrend(field.key) < 0 ? 'text-red-500' : 'text-muted-foreground'
                      }`}>
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        {getTrend(field.key) > 0 ? '+' : ''}{getTrend(field.key).toFixed(1)} {field.unit}
                      </div>
                    </Card>

                    <Card className="p-3 sm:p-4">
                      <div className="text-xs sm:text-sm text-muted-foreground">Messungen</div>
                      <div className="text-lg sm:text-2xl font-bold text-primary">
                        {measurements.length}
                      </div>
                    </Card>

                    <Card className="p-3 sm:p-4">
                      <div className="text-xs sm:text-sm text-muted-foreground">Max</div>
                      <div className="text-lg sm:text-2xl font-bold text-orange-400">
                        {measurements.length > 0 
                          ? Math.max(...measurements.map(m => m[field.key as keyof MeasurementData] as number)).toFixed(1)
                          : 0
                        } {field.unit}
                      </div>
                    </Card>
                  </div>

                  {/* Chart */}
                  <Card className="p-4 sm:p-6">
                    <div className="h-64 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getChartData(field.key)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="date" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            labelStyle={{ color: "hsl(var(--foreground))" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={field.color}
                            strokeWidth={2}
                            dot={{ fill: field.color, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: field.color }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Recent Measurements */}
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-lg font-medium mb-4">Letzte Messungen</h3>
                    <div className="space-y-2 max-h-40 sm:max-h-60 overflow-y-auto">
                      {measurements
                        .slice(-10)
                        .reverse()
                        .map((measurement, index) => (
                          <div key={measurement.id || index} className="flex items-center justify-between p-2 sm:p-3 bg-card/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs">
                                {format(new Date(measurement.date), "dd.MM.yy", { locale: de })}
                              </Badge>
                              <span className="font-medium text-sm sm:text-base">
                                {measurement[field.key as keyof MeasurementData]} {field.unit}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Measurements;
