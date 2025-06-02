
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Droplet, Beef, Zap, Target } from "lucide-react";
import { supabaseStorageService } from "@/services/supabaseStorageService";
import { toast } from "@/components/ui/use-toast";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface NutritionData {
  id?: string;
  date: string;
  calories: number;
  protein: number;
  water: number;
  target_calories: number;
  target_protein: number;
  target_water: number;
  user_id?: string;
}

const NutritionTracker = () => {
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    calories: 0,
    protein: 0,
    water: 0,
    target_calories: 4864,
    target_protein: 280,
    target_water: 4000
  });
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (user) {
      loadTodaysNutrition();
    }
  }, [user]);

  const loadTodaysNutrition = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const records = await supabaseStorageService.getNutritionRecords();
      const todayRecord = records.find(record => record.date === today);
      
      if (todayRecord) {
        setNutritionData({
          id: todayRecord.id,
          date: todayRecord.date,
          calories: todayRecord.calories || 0,
          protein: todayRecord.protein || 0,
          water: todayRecord.water || 0,
          target_calories: todayRecord.target_calories || 4864,
          target_protein: todayRecord.target_protein || 280,
          target_water: todayRecord.target_water || 4000
        });
      }
    } catch (error) {
      console.error('Error loading nutrition data:', error);
      toast({
        title: "Fehler",
        description: "Ernährungsdaten konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNutritionData = async (updatedData: NutritionData) => {
    try {
      await supabaseStorageService.saveNutritionRecords([{
        id: updatedData.id,
        date: updatedData.date,
        calories: updatedData.calories,
        protein: updatedData.protein,
        water: updatedData.water,
        target_calories: updatedData.target_calories,
        target_protein: updatedData.target_protein,
        target_water: updatedData.target_water
      }]);
      
      toast({
        title: "Gespeichert",
        description: "Ernährungsdaten wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      console.error('Error saving nutrition data:', error);
      toast({
        title: "Fehler",
        description: "Ernährungsdaten konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const updateValue = async (field: keyof NutritionData, value: number) => {
    const updatedData = { ...nutritionData, [field]: value };
    setNutritionData(updatedData);
    await saveNutritionData(updatedData);
  };

  const addValue = async (field: keyof NutritionData, amount: number) => {
    const currentValue = nutritionData[field] as number;
    const newValue = Math.max(0, currentValue + amount);
    await updateValue(field, newValue);
  };

  if (!user) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Bitte melde dich an, um deine Ernährung zu verfolgen.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Lade Ernährungsdaten...</p>
        </CardContent>
      </Card>
    );
  }

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Ernährung heute
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Kalorien */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Kalorien</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {nutritionData.calories} / {nutritionData.target_calories} kcal
            </span>
          </div>
          <Progress 
            value={(nutritionData.calories / nutritionData.target_calories) * 100} 
            className="h-2"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              value={nutritionData.calories}
              onChange={(e) => updateValue('calories', Number(e.target.value))}
              className="text-xs h-8"
            />
            <Button size="sm" onClick={() => addValue('calories', 100)} className="h-8 px-2 text-xs">
              +100
            </Button>
            <Button size="sm" onClick={() => addValue('calories', 500)} className="h-8 px-2 text-xs">
              +500
            </Button>
          </div>
        </div>

        {/* Protein */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Beef className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Protein</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {nutritionData.protein} / {nutritionData.target_protein}g
            </span>
          </div>
          <Progress 
            value={(nutritionData.protein / nutritionData.target_protein) * 100} 
            className="h-2"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              value={nutritionData.protein}
              onChange={(e) => updateValue('protein', Number(e.target.value))}
              className="text-xs h-8"
            />
            <Button size="sm" onClick={() => addValue('protein', 10)} className="h-8 px-2 text-xs">
              +10g
            </Button>
            <Button size="sm" onClick={() => addValue('protein', 25)} className="h-8 px-2 text-xs">
              +25g
            </Button>
          </div>
        </div>

        {/* Wasser */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Wasser</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {nutritionData.water} / {nutritionData.target_water}ml
            </span>
          </div>
          <Progress 
            value={(nutritionData.water / nutritionData.target_water) * 100} 
            className="h-2"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              value={nutritionData.water}
              onChange={(e) => updateValue('water', Number(e.target.value))}
              className="text-xs h-8"
            />
            <Button size="sm" onClick={() => addValue('water', 250)} className="h-8 px-2 text-xs">
              +250ml
            </Button>
            <Button size="sm" onClick={() => addValue('water', 500)} className="h-8 px-2 text-xs">
              +500ml
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionTracker;
