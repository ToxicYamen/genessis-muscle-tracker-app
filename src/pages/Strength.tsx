
import { useState } from "react";
import { motion } from "framer-motion";
import { useTrackingData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { format } from "date-fns";
import { Edit2, Trash2, Target, TrendingUp, Calendar, Dumbbell, Trophy, Zap } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Strength = () => {
  const { strengthExercises, addStrengthRecord } = useTrackingData();
  const [selectedExercise, setSelectedExercise] = useState(strengthExercises[0]?.name || "");
  const [weightValue, setWeightValue] = useState("");
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  
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

  const handleEditRecord = (date: string, currentValue: number) => {
    setEditingRecord(date);
    setEditValue(currentValue.toString());
  };

  const saveEdit = () => {
    if (!editingRecord || !editValue) return;
    
    const numericValue = parseFloat(editValue);
    if (isNaN(numericValue)) return;
    
    addStrengthRecord(selectedExercise, {
      date: editingRecord,
      value: numericValue
    });
    
    setEditingRecord(null);
    setEditValue("");
    
    toast({
      title: "Kraftwert aktualisiert",
      description: "Der Kraftwert wurde erfolgreich geändert.",
    });
  };

  // Format data for the chart
  const chartData = currentExercise?.records.map(r => ({
    date: r.date,
    value: r.value,
    formattedDate: format(new Date(r.date), "dd.MM")
  }));

  // Calculate progress stats
  const getProgressStats = () => {
    if (!currentExercise || currentExercise.records.length === 0) return null;
    
    const records = currentExercise.records;
    const latest = records[records.length - 1].value;
    const naturalProgress = ((latest / currentExercise.naturalTarget) * 100);
    const enhancedProgress = ((latest / currentExercise.enhancedTarget) * 100);
    
    let trend = 0;
    if (records.length >= 2) {
      const recent = records.slice(-2);
      trend = recent[1].value - recent[0].value;
    }
    
    return { latest, naturalProgress, enhancedProgress, trend };
  };

  const stats = getProgressStats();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <h2 className="text-3xl font-bold">Kraftentwicklung</h2>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Dumbbell className="w-4 h-4 mr-2" />
            {selectedExercise}
          </Badge>
          {stats && (
            <Badge className="text-lg px-3 py-1 bg-gradient-to-r from-red-500 to-orange-600">
              {stats.latest} kg
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
          defaultValue={selectedExercise} 
          onValueChange={setSelectedExercise}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full">
            {strengthExercises.map((exercise) => (
              <TabsTrigger key={exercise.name} value={exercise.name} className="text-xs">
                {exercise.name.split(' ')[0]}
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
          {stats && (
            <Card className="bg-gradient-to-br from-red-50 to-orange-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Aktuelle Leistung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-red-600">{stats.latest} kg</div>
                  <div className="text-sm text-muted-foreground">Aktueller Rekord</div>
                </div>
                
                {stats.trend !== 0 && (
                  <div className={`text-center p-4 bg-white rounded-lg ${stats.trend >= 0 ? 'border-green-200' : 'border-red-200'} border-2`}>
                    <div className={`flex items-center justify-center gap-2 text-lg font-semibold ${stats.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendingUp className="w-5 h-5" />
                      {stats.trend >= 0 ? '+' : ''}{stats.trend} kg
                    </div>
                    <div className="text-sm text-muted-foreground">Letzter Fortschritt</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{stats.naturalProgress.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Natural Ziel</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{stats.enhancedProgress.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Enhanced Ziel</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Neuen Kraftwert eintragen
              </CardTitle>
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
                    className="text-lg"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700">
                  Kraftwert speichern
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Letzte Einträge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {currentExercise?.records.slice(-5).reverse().map((record, index) => (
                  <motion.div
                    key={record.date}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{record.value} kg</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(record.date), "dd.MM.yyyy")}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditRecord(record.date, record.value)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
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
              <CardTitle>Kraftentwicklung: {selectedExercise}</CardTitle>
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
                        <linearGradient id="colorStrength" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
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
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        fill="url(#colorStrength)"
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: 'white' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4">💪</div>
                      <p className="text-muted-foreground text-lg">Keine Daten verfügbar</p>
                      <p className="text-sm text-muted-foreground">Füge deinen ersten Kraftwert hinzu</p>
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
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Zielwerte für {selectedExercise}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentExercise && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="text-center">
                      <Badge className="mb-3 bg-blue-600">Natural-Ziel (22 Jahre)</Badge>
                      <div className="text-3xl font-bold text-blue-600">{currentExercise.naturalTarget} kg</div>
                      {stats && (
                        <div className="mt-2">
                          <div className="text-sm text-muted-foreground">
                            Noch {Math.max(0, currentExercise.naturalTarget - stats.latest)} kg
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, stats.naturalProgress)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-6 bg-gradient-to-br from-purple-50 to-pink-100">
                    <div className="text-center">
                      <Badge className="mb-3 bg-purple-600">Mit Substanzen (22 Jahre)</Badge>
                      <div className="text-3xl font-bold text-purple-600">{currentExercise.enhancedTarget} kg</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        +{currentExercise.enhancedTarget - currentExercise.naturalTarget} kg extra
                      </div>
                      {stats && (
                        <div className="mt-2">
                          <div className="text-sm text-muted-foreground">
                            Noch {Math.max(0, currentExercise.enhancedTarget - stats.latest)} kg
                          </div>
                          <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, stats.enhancedProgress)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Modal */}
      {editingRecord && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setEditingRecord(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Kraftwert bearbeiten</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Datum</label>
                <div className="text-muted-foreground">
                  {format(new Date(editingRecord), "dd.MM.yyyy")}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Gewicht (kg)</label>
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEdit} className="flex-1">
                  Speichern
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingRecord(null)}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Strength;
