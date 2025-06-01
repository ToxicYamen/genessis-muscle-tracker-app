
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTrackingData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { TrendingUp, TrendingDown, Target, Calendar, Ruler } from "lucide-react";
import { useStore } from "@/store/useStore";
import { toast } from "@/components/ui/use-toast";

type ChartDataPoint = {
  date: string;
  value: number;
  formattedDate: string;
  name?: 'Biceps' | 'Trizeps';
};

const Measurements = () => {
  const { muscleGroups: originalMuscleGroups, addMeasurement } = useTrackingData();
  
  // Use original muscle groups directly
  const muscleGroups = [...originalMuscleGroups];
  
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(muscleGroups[0]?.name || "");
  const [measurement, setMeasurement] = useState("");
  
  // Get the current group
  const currentGroup = originalMuscleGroups.find(group => group.name === selectedMuscleGroup);
  
  // Direkte Referenz auf den Store
  const { setHeight, setWeight, setBodyFat } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMuscleGroup || !measurement) return;
    
    const numericMeasurement = parseFloat(measurement);
    if (isNaN(numericMeasurement)) return;
    
    try {
      // Add measurement for the selected muscle group
      await addMeasurement(selectedMuscleGroup, {
        date: format(new Date(), "yyyy-MM-dd"),
        value: numericMeasurement
      });
      
      // Aktualisiere den Store direkt, wenn es sich um eine der Körpermetriken handelt
      if (selectedMuscleGroup === "Gewicht") {
        setWeight(numericMeasurement);
        toast({ 
          title: "Gewicht aktualisiert", 
          description: `Dein Gewicht wurde auf ${numericMeasurement} kg aktualisiert.` 
        });
      } else if (selectedMuscleGroup === "Größe") {
        setHeight(numericMeasurement);
        toast({ 
          title: "Größe aktualisiert", 
          description: `Deine Größe wurde auf ${numericMeasurement} cm aktualisiert.` 
        });
      } else if (selectedMuscleGroup === "Körperfett") {
        setBodyFat(numericMeasurement);
        toast({ 
          title: "Körperfett aktualisiert", 
          description: `Dein Körperfettanteil wurde auf ${numericMeasurement}% aktualisiert.` 
        });
      }
      
      setMeasurement("");
    } catch (error) {
      console.error("Fehler beim Hinzufügen der Messung:", error);
      toast({ 
        title: "Fehler", 
        description: "Die Messung konnte nicht gespeichert werden.",
        variant: "destructive" 
      });
    }
  };

  // Format data for the chart
  const chartData: ChartDataPoint[] | undefined = currentGroup?.measurements.map(m => ({
    date: m.date,
    value: m.value,
    formattedDate: format(new Date(m.date), "dd.MM")
  }));

  // Calculate trend
  const getTrend = () => {
    if (!currentGroup || currentGroup.measurements.length < 2) return null;
    
    // For Armumfang, we want to consider the average of both arms
    if (selectedMuscleGroup === 'Armumfang') {
      const recent = currentGroup.measurements.slice(-2);
      if (recent.length < 2) return null;
      
      // Calculate average for the two most recent measurements
      const avg1 = recent[0].value;
      const avg2 = recent[1].value;
      return avg2 - avg1;
    }
    
    // For other muscle groups, use the standard calculation
    const recent = currentGroup.measurements.slice(-2);
    return recent[1].value - recent[0].value;
  };

  const trend = getTrend();
  const currentValue = currentGroup?.measurements[currentGroup.measurements.length - 1]?.value;
  const currentGoal = currentGroup?.goals[0]; // Assuming current age goal

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <h2 className="text-3xl font-bold">Körpermaße Tracking</h2>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Ruler className="w-4 h-4 mr-2" />
            {selectedMuscleGroup}
          </Badge>
          {currentValue && (
            <Badge className="text-lg px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600">
              {currentValue} cm
            </Badge>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs 
          defaultValue={selectedMuscleGroup} 
          onValueChange={setSelectedMuscleGroup}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 w-full">
            {muscleGroups.map((group) => (
              <TabsTrigger key={group.name} value={group.name} className="text-xs">
                {group.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1 space-y-6"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Aktuelle Statistiken
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentValue && (
                <div className="text-center p-4 bg-card/50 rounded-lg border border-border">
                  <div className="text-3xl font-bold text-blue-400">{currentValue} cm</div>
                  <div className="text-sm text-muted-foreground">Aktueller Wert</div>
                </div>
              )}
              
              {trend !== null && (
                <div className={`text-center p-4 bg-card/50 rounded-lg border ${trend >= 0 ? 'border-green-500/30' : 'border-red-500/30'}`}>
                  <div className={`flex items-center justify-center gap-2 text-lg font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {trend >= 0 ? '+' : ''}{trend.toFixed(1)} cm
                  </div>
                  <div className="text-sm text-muted-foreground">Letzter Trend</div>
                </div>
              )}

              {currentGoal && (
                <div className="text-center p-4 bg-card/50 rounded-lg border border-border">
                  <div className="text-xl font-bold text-purple-400">{currentGoal.targetValue} cm</div>
                  <div className="text-sm text-muted-foreground">Jahresziel</div>
                  {currentValue && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Noch {(currentGoal.targetValue - currentValue).toFixed(1)} cm
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Neue Messung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="measurement" className="text-sm font-medium">
                    {selectedMuscleGroup} Umfang (cm)
                  </label>
                  <Input
                    id="measurement"
                    type="number"
                    step="0.1"
                    placeholder="z.B. 35.5"
                    value={measurement}
                    onChange={(e) => setMeasurement(e.target.value)}
                    required
                    className="text-lg"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Messung speichern
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Entwicklung: {selectedMuscleGroup}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="formattedDate" 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(240, 10%, 10%)',
                          border: '1px solid hsl(240, 10%, 20%)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                          color: 'hsl(0, 0%, 90%)'
                        }}
                        labelStyle={{ color: 'hsl(0, 0%, 90%)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fill="url(#colorValue)"
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📏</div>
                      <p className="text-muted-foreground text-lg">Keine Daten verfügbar</p>
                      <p className="text-sm text-muted-foreground">Füge deine erste Messung hinzu</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Jahres-Ziele für {selectedMuscleGroup}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentGroup && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentGroup.goals.map((goal, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border rounded-lg p-4 bg-card/50 border-border hover:bg-accent/20 transition-colors"
                  >
                    <div className="text-center">
                      <Badge variant="secondary" className="mb-2">
                        {goal.age} Jahre
                      </Badge>
                      <div className="text-lg font-semibold">
                        {goal.startValue} → {goal.endValue} cm
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        +{goal.extraGain} cm extra
                      </div>
                      <div className="text-xl font-bold text-blue-400 mt-2">
                        = {goal.targetValue} cm
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Measurements;
