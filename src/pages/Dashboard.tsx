
import { useState } from "react";
import { useTrackingData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart, Cell, Bar, XAxis, YAxis, Tooltip, Legend, Pie, ResponsiveContainer } from "recharts";
import { ChartData } from "@/types";

const Dashboard = () => {
  const { personalData, muscleGroups, strengthExercises, milestones } = useTrackingData();
  const [selectedYear, setSelectedYear] = useState<number>(19); // Default to first year (age 19)

  // Find current milestone based on selected year
  const currentMilestone = milestones.find(m => m.age === selectedYear);

  // Prepare data for muscle growth chart
  const muscleChartData: ChartData[] = muscleGroups.map(group => {
    const goal = group.goals.find(g => g.age === selectedYear);
    const latestMeasurement = group.measurements.length > 0 
      ? group.measurements[group.measurements.length - 1].value 
      : 0;
      
    return {
      name: group.name,
      value: latestMeasurement,
      target: goal ? goal.targetValue : 0
    };
  });

  // Prepare data for strength progress
  const strengthChartData: ChartData[] = strengthExercises.map(exercise => {
    const latestRecord = exercise.records.length > 0 
      ? exercise.records[exercise.records.length - 1].value 
      : 0;
    
    return {
      name: exercise.name.split(' ')[0], // First word only for better display
      value: latestRecord,
      target: exercise.naturalTarget
    };
  });

  // Profile completion calculation
  const hasMeasurements = muscleGroups.some(group => group.measurements.length > 0);
  const hasStrengthRecords = strengthExercises.some(exercise => exercise.records.length > 0);
  
  const completionItems = [
    { name: "Persönliche Daten", completed: true },
    { name: "Muskelumfänge", completed: hasMeasurements },
    { name: "Kraftwerte", completed: hasStrengthRecords }
  ];
  
  const completionPercentage = Math.round(
    (completionItems.filter(item => item.completed).length / completionItems.length) * 100
  );
  
  const completionData = [
    { name: "Abgeschlossen", value: completionPercentage },
    { name: "Offen", value: 100 - completionPercentage }
  ];

  const COLORS = ["#000000", "#CCCCCC"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hallo, {personalData.name}</h2>
          <p className="text-muted-foreground">Alter: {personalData.age} Jahre, Gewicht: {personalData.weight} kg</p>
        </div>
        
        <Tabs defaultValue="19" onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <TabsList className="grid grid-cols-4 w-[300px]">
            <TabsTrigger value="19">19 Jahre</TabsTrigger>
            <TabsTrigger value="20">20 Jahre</TabsTrigger>
            <TabsTrigger value="21">21 Jahre</TabsTrigger>
            <TabsTrigger value="22">22 Jahre</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Profil-Vollständigkeit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-2 space-y-1">
              {completionItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{item.name}</span>
                  <span className={`text-sm ${item.completed ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {item.completed ? "✓" : "–"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Muskelmeilensteine {selectedYear} Jahre</CardTitle>
          </CardHeader>
          <CardContent>
            {currentMilestone && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Gewicht</p>
                    <p className="text-2xl font-bold">{currentMilestone.weight} kg</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Körperfett</p>
                    <p className="text-2xl font-bold">{currentMilestone.bodyFat}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Armumfang</p>
                    <p className="text-2xl font-bold">{currentMilestone.armSize} cm</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Schulterbreite</p>
                    <p className="text-2xl font-bold">{currentMilestone.shoulderSize} cm</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Fokus</p>
                  <p className="text-lg font-medium">{currentMilestone.note}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Muskelwachstum-Diagramm (Aktuell vs. Ziel für {selectedYear} Jahre)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={muscleChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Aktueller Wert (cm)" fill="#000000" />
                  <Bar dataKey="target" name="Ziel (cm)" fill="#666666" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Kraftentwicklung (Aktuell vs. Ziel)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={strengthChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Aktueller Wert (kg)" fill="#000000" />
                  <Bar dataKey="target" name="Ziel (kg)" fill="#666666" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
