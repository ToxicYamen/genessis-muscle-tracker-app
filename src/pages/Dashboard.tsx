import { useState } from "react";
import { useTrackingData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart, LineChart, Cell, Bar, XAxis, YAxis, Tooltip, Legend, Pie, Line, ResponsiveContainer } from "recharts";
import { ChartData } from "@/types";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import { CalendarIcon, ChartBarIcon, CircleCheckIcon, CirclePercentIcon, DropletIcon, Utensils, StarIcon, RulerIcon, WeightIcon } from "lucide-react";

const Dashboard = () => {
  const { personalData, muscleGroups, strengthExercises, milestones } = useTrackingData();
  const [selectedYear, setSelectedYear] = useState<number>(19); // Default to first year (age 19)

  // Find current milestone based on selected year
  const currentMilestone = milestones.find(m => m.age === selectedYear);
  
  // Calculate current age progress (assuming 4-year plan, starting at age 19)
  const currentAge = personalData.age;
  const startAge = 19;
  const endAge = 22;
  const ageProgress = Math.min(100, Math.max(0, Math.round(((currentAge - startAge) / (endAge - startAge)) * 100)));
  
  // Prepare data for muscle growth chart
  const muscleChartData: ChartData[] = muscleGroups.map(group => {
    const goal = group.goals.find(g => g.age === selectedYear);
    const latestMeasurement = group.measurements.length > 0 
      ? group.measurements[group.measurements.length - 1].value 
      : 0;
      
    // Calculate progress percentage toward goal
    const targetValue = goal ? goal.targetValue : 0;
    const progressPercentage = targetValue > 0 
      ? Math.min(100, Math.round((latestMeasurement / targetValue) * 100)) 
      : 0;
      
    return {
      name: group.name,
      value: latestMeasurement,
      target: targetValue,
      progress: progressPercentage
    };
  });

  // Prepare data for strength progress
  const strengthChartData: ChartData[] = strengthExercises.map(exercise => {
    const latestRecord = exercise.records.length > 0 
      ? exercise.records[exercise.records.length - 1].value 
      : 0;
    
    // Calculate progress percentage toward goal
    const targetValue = exercise.naturalTarget;
    const progressPercentage = targetValue > 0 
      ? Math.min(100, Math.round((latestRecord / targetValue) * 100)) 
      : 0;
    
    return {
      name: exercise.name.split(' ')[0], // First word only for better display
      value: latestRecord,
      target: exercise.naturalTarget,
      progress: progressPercentage
    };
  });

  // Dummy data for progress tracking over time (would be replaced with real data)
  const progressOverTimeData = [
    { month: "Jul 25", weight: 70, muscle: 35, strength: 30 },
    { month: "Aug 25", weight: 72, muscle: 37, strength: 35 },
    { month: "Sep 25", weight: 73, muscle: 39, strength: 40 },
    { month: "Oct 25", weight: 74, muscle: 40, strength: 42 },
    { month: "Nov 25", weight: 76, muscle: 41, strength: 45 },
    { month: "Dec 25", weight: 77, muscle: 42, strength: 48 },
  ];

  // Nutrition tracking data (dummy data for now)
  const nutritionData = {
    calories: {
      current: 3800,
      target: personalData.calories,
      percentage: Math.round((3800 / personalData.calories) * 100)
    },
    protein: {
      current: 230,
      target: personalData.protein,
      percentage: Math.round((230 / personalData.protein) * 100)
    },
    water: {
      current: 3.5,
      target: 5,
      percentage: Math.round((3.5 / 5) * 100)
    }
  };

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

  // Colors for various charts
  const COLORS = ["#000000", "#CCCCCC"];
  const PROGRESS_COLORS = ["#000000", "#333333", "#666666"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hallo, {personalData.name}</h2>
          <p className="text-muted-foreground">Alter: {personalData.age} Jahre, Gewicht: {personalData.weight} kg</p>
        </div>
        
        <Tabs defaultValue="19" onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <TabsList className="grid grid-cols-4 w-[300px] rounded-full">
            <TabsTrigger value="19" className="rounded-full">19 Jahre</TabsTrigger>
            <TabsTrigger value="20" className="rounded-full">20 Jahre</TabsTrigger>
            <TabsTrigger value="21" className="rounded-full">21 Jahre</TabsTrigger>
            <TabsTrigger value="22" className="rounded-full">22 Jahre</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overall Progress Section */}
      <Card className="shadow-md animate-scale-in card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <StarIcon className="h-5 w-5" />
            Gesamt-Fortschritt zum 4-Jahre-Ziel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Jahr {currentAge - startAge + 1} von 4</span>
              <span className="text-sm text-muted-foreground">{ageProgress}%</span>
            </div>
            <Progress value={ageProgress} className="h-2.5" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="stat-container">
                <div className="flex items-center gap-2">
                  <WeightIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Aktuelles Gewicht</span>
                </div>
                <span className="text-2xl font-bold">{personalData.weight} kg</span>
                <span className="text-xs text-muted-foreground">Ziel: {currentMilestone?.weight} kg</span>
              </div>
              
              <div className="stat-container">
                <div className="flex items-center gap-2">
                  <RulerIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Aktuelle Armgröße</span>
                </div>
                <span className="text-2xl font-bold">
                  {muscleGroups.find(g => g.name === "Bizeps")?.measurements[0]?.value || "?"}
                  <span className="text-sm"> cm</span>
                </span>
                <span className="text-xs text-muted-foreground">Ziel: {currentMilestone?.armSize} cm</span>
              </div>
              
              <div className="stat-container">
                <div className="flex items-center gap-2">
                  <CirclePercentIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Körperfett</span>
                </div>
                <span className="text-2xl font-bold">{personalData.bodyFat}%</span>
                <span className="text-xs text-muted-foreground">Ziel: {currentMilestone?.bodyFat}</span>
              </div>
              
              <div className="stat-container">
                <div className="flex items-center gap-2">
                  <CircleCheckIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Profil-Vollständigkeit</span>
                </div>
                <span className="text-2xl font-bold">{completionPercentage}%</span>
                <span className="text-xs text-muted-foreground">3 von 3 Kategorien</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profil-Vollständigkeit */}
        <Card className="shadow-md animate-slide-in card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <CircleCheckIcon className="h-4 w-4" />
              Profil-Vollständigkeit
            </CardTitle>
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
                    animationBegin={0}
                    animationDuration={1500}
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

        {/* Muskelmeilensteine */}
        <Card className="shadow-md animate-slide-in card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <StarIcon className="h-4 w-4" />
              Muskelmeilensteine {selectedYear} Jahre
            </CardTitle>
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

        {/* Ernährung und Flüssigkeitszufuhr */}
        <Card className="shadow-md animate-slide-in card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Tägliche Ernährung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Kalorien</span>
                  <span className="text-sm text-muted-foreground">
                    {nutritionData.calories.current} / {nutritionData.calories.target} kcal
                  </span>
                </div>
                <Progress value={nutritionData.calories.percentage} className="h-2 mt-1" />
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Protein</span>
                  <span className="text-sm text-muted-foreground">
                    {nutritionData.protein.current} / {nutritionData.protein.target} g
                  </span>
                </div>
                <Progress value={nutritionData.protein.percentage} className="h-2 mt-1" />
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Wasser</span>
                  <span className="text-sm text-muted-foreground">
                    {nutritionData.water.current} / {nutritionData.water.target} L
                  </span>
                </div>
                <Progress value={nutritionData.water.percentage} className="h-2 mt-1" />
              </div>
              
              <div className="pt-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <DropletIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Trinkziel heute</span>
                </div>
                <div className="h-[80px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Getrunken", value: nutritionData.water.percentage },
                          { name: "Noch offen", value: 100 - nutritionData.water.percentage }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={35}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1500}
                      >
                        <Cell fill="#000000" />
                        <Cell fill="#CCCCCC" />
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fortschrittsverlauf */}
        <Card className="lg:col-span-3 shadow-md animate-fade-in card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4" />
              Fortschrittsverlauf
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={progressOverTimeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="weight" name="Gewicht (kg)" stroke="#000000" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="muscle" name="Muskelumfang (cm)" stroke="#555555" />
                  <Line type="monotone" dataKey="strength" name="Kraft (%)" stroke="#999999" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Muskelwachstum-Diagramm */}
        <Card className="lg:col-span-3 shadow-md animate-fade-in card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4" />
              Muskelwachstum-Diagramm (Aktuell vs. Ziel für {selectedYear} Jahre)
            </CardTitle>
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
                  <Bar dataKey="value" name="Aktueller Wert (cm)" fill="#000000" animationBegin={0} animationDuration={1500} />
                  <Bar dataKey="target" name="Ziel (cm)" fill="#666666" animationBegin={500} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Kraftentwicklung */}
        <Card className="lg:col-span-3 shadow-md animate-fade-in card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4" />
              Kraftentwicklung (Aktuell vs. Ziel)
            </CardTitle>
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
                  <Bar dataKey="value" name="Aktueller Wert (kg)" fill="#000000" animationBegin={0} animationDuration={1500} />
                  <Bar dataKey="target" name="Ziel (kg)" fill="#666666" animationBegin={500} animationDuration={1500} />
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
