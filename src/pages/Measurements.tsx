
import { useState } from "react";
import { useTrackingData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const Measurements = () => {
  const { muscleGroups, addMeasurement } = useTrackingData();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(muscleGroups[0]?.name || "");
  const [measurement, setMeasurement] = useState("");
  
  const currentGroup = muscleGroups.find(group => group.name === selectedMuscleGroup);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMuscleGroup || !measurement) return;
    
    const numericMeasurement = parseFloat(measurement);
    if (isNaN(numericMeasurement)) return;
    
    addMeasurement(selectedMuscleGroup, {
      date: format(new Date(), "yyyy-MM-dd"),
      value: numericMeasurement
    });
    
    setMeasurement("");
  };

  // Format data for the chart
  const chartData = currentGroup?.measurements.map(m => ({
    date: m.date,
    value: m.value,
    formattedDate: format(new Date(m.date), "dd.MM.yyyy")
  }));

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue={selectedMuscleGroup} 
        onValueChange={setSelectedMuscleGroup}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {muscleGroups.map((group) => (
            <TabsTrigger key={group.name} value={group.name}>
              {group.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Muskelumfang-Entwicklung: {selectedMuscleGroup}</CardTitle>
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
                      label={{ value: "Umfang (cm)", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Umfang (cm)" stroke="#000000" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Keine Daten verfügbar. Füge deine erste Messung hinzu.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle>Neue Messung eintragen</CardTitle>
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
                />
              </div>
              <Button type="submit" className="w-full">
                Messung speichern
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Jahres-Ziele für {selectedMuscleGroup}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentGroup && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {currentGroup.goals.map((goal, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Alter: {goal.age} Jahre</p>
                      <p className="font-medium">
                        {goal.startValue} → {goal.endValue} cm
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        +{goal.extraGain} cm extra = {goal.targetValue} cm
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm">
                    Aktuelle Messung: 
                    <span className="font-bold ml-1">
                      {currentGroup.measurements.length > 0 
                        ? `${currentGroup.measurements[currentGroup.measurements.length - 1].value} cm` 
                        : "Keine Daten"}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Measurements;
