
import { useState } from "react";
import { useTrackingData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const Strength = () => {
  const { strengthExercises, addStrengthRecord } = useTrackingData();
  const [selectedExercise, setSelectedExercise] = useState(strengthExercises[0]?.name || "");
  const [weightValue, setWeightValue] = useState("");
  
  const currentExercise = strengthExercises.find(exercise => exercise.name === selectedExercise);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExercise || !weightValue) return;
    
    const numericValue = parseFloat(weightValue);
    if (isNaN(numericValue)) return;
    
    addStrengthRecord(selectedExercise, {
      date: format(new Date(), "yyyy-MM-dd"),
      value: numericValue
    });
    
    setWeightValue("");
  };

  // Format data for the chart
  const chartData = currentExercise?.records.map(r => ({
    date: r.date,
    value: r.value,
    formattedDate: format(new Date(r.date), "dd.MM.yyyy")
  }));

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue={selectedExercise} 
        onValueChange={setSelectedExercise}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          {strengthExercises.map((exercise) => (
            <TabsTrigger key={exercise.name} value={exercise.name} className="text-xs md:text-sm">
              {exercise.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Kraftentwicklung: {selectedExercise}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="formattedDate" 
                      label={{ value: "Datum", position: "insideBottom", offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: "Gewicht (kg)", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Gewicht (kg)" stroke="#000000" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Keine Daten verfügbar. Füge deinen ersten Kraftwert hinzu.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle>Neuen Kraftwert eintragen</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="weight" className="text-sm font-medium">
                  {selectedExercise} (kg)
                </label>
                <Input
                  id="weight"
                  type="number"
                  step="1"
                  placeholder="z.B. 100"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Kraftwert speichern
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Zielwerte für {selectedExercise}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentExercise && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Natural-Ziel (22 Jahre)</p>
                    <p className="text-xl font-bold">{currentExercise.naturalTarget} kg</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Mit Substanzen (22 Jahre)</p>
                    <p className="text-xl font-bold">{currentExercise.enhancedTarget} kg</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      +{currentExercise.enhancedTarget - currentExercise.naturalTarget} kg extra
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm">
                    Aktuelle Leistung: 
                    <span className="font-bold ml-1">
                      {currentExercise.records.length > 0 
                        ? `${currentExercise.records[currentExercise.records.length - 1].value} kg` 
                        : "Keine Daten"}
                    </span>
                  </p>
                  {currentExercise.records.length > 0 && (
                    <p className="text-sm mt-1">
                      Noch zu erreichen: 
                      <span className="font-medium ml-1">
                        {currentExercise.naturalTarget - currentExercise.records[currentExercise.records.length - 1].value} kg
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Strength;
