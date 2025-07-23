
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Utensils } from "lucide-react";
import { storageService, NutritionData } from "@/services/storageService";
import { supabaseStorageService } from "@/services/supabaseStorageService";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const NutritionTracker = () => {
  const { user } = useSupabaseAuth();
  const [nutrition, setNutrition] = useState<NutritionData>({
    calories: 0,
    protein: 0,
    water: 0,
    targetCalories: 4864,
    targetProtein: 280,
    targetWater: 4000
  });
  const [calorieInput, setCalorieInput] = useState("");
  const [proteinInput, setProteinInput] = useState("");

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user) {
      loadNutrition();
    }
  }, [user]);

  const loadNutrition = async () => {
    try {
      const nutritionData = await supabaseStorageService.getNutritionRecords();
      const todayNutrition = nutritionData.find(n => n.date === today);
      
      setNutrition({
        calories: todayNutrition?.calories || 0,
        protein: todayNutrition?.protein || 0,
        water: todayNutrition?.water || 0,
        targetCalories: todayNutrition?.target_calories || 4864,
        targetProtein: todayNutrition?.target_protein || 280,
        targetWater: todayNutrition?.target_water || 4000
      });
    } catch (error) {
      console.error('Error loading nutrition:', error);
      // Fallback to localStorage
      const data = storageService.getNutrition(today);
      setNutrition(data);
    }
  };

  const addCalories = async () => {
    if (calorieInput && !isNaN(Number(calorieInput))) {
      const amount = Number(calorieInput);
      try {
        const currentNutrition = {
          date: today,
          calories: nutrition.calories + amount,
          protein: nutrition.protein,
          water: nutrition.water,
          target_calories: nutrition.targetCalories,
          target_protein: nutrition.targetProtein,
          target_water: nutrition.targetWater
        };
        
        await supabaseStorageService.saveNutritionRecords([currentNutrition]);
        setCalorieInput("");
        await loadNutrition();
        
        // Trigger dashboard update
        window.dispatchEvent(new CustomEvent('nutritionUpdate'));
        
        toast({
          title: "Kalorien hinzugefügt",
          description: `${amount} kcal wurden hinzugefügt.`,
        });
      } catch (error) {
        console.error('Error saving calories:', error);
        // Fallback to localStorage
        storageService.addNutritionValue(today, 'calories', amount);
        setCalorieInput("");
        loadNutrition();
        toast({
          title: "Kalorien hinzugefügt",
          description: `${amount} kcal wurden hinzugefügt.`,
        });
      }
    }
  };

  const addProtein = async () => {
    if (proteinInput && !isNaN(Number(proteinInput))) {
      const amount = Number(proteinInput);
      try {
        const currentNutrition = {
          date: today,
          calories: nutrition.calories,
          protein: nutrition.protein + amount,
          water: nutrition.water,
          target_calories: nutrition.targetCalories,
          target_protein: nutrition.targetProtein,
          target_water: nutrition.targetWater
        };
        
        await supabaseStorageService.saveNutritionRecords([currentNutrition]);
        setProteinInput("");
        await loadNutrition();
        
        // Trigger dashboard update
        window.dispatchEvent(new CustomEvent('nutritionUpdate'));
        
        toast({
          title: "Protein hinzugefügt",
          description: `${amount}g Protein wurden hinzugefügt.`,
        });
      } catch (error) {
        console.error('Error saving protein:', error);
        // Fallback to localStorage
        storageService.addNutritionValue(today, 'protein', amount);
        setProteinInput("");
        loadNutrition();
        toast({
          title: "Protein hinzugefügt",
          description: `${amount}g Protein wurden hinzugefügt.`,
        });
      }
    }
  };

  const calorieProgress = (nutrition.calories / nutrition.targetCalories) * 100;
  const proteinProgress = (nutrition.protein / nutrition.targetProtein) * 100;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Utensils className="h-5 w-5 text-primary" />
          Ernährung heute
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Kalorien */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Kalorien</Label>
            <span className="text-sm text-muted-foreground">
              {nutrition.calories} / {nutrition.targetCalories} kcal
            </span>
          </div>
          <Progress value={Math.min(calorieProgress, 100)} className="h-2" />
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Kalorien"
              value={calorieInput}
              onChange={(e) => setCalorieInput(e.target.value)}
              className="text-sm h-8"
            />
            <Button onClick={addCalories} size="sm" className="h-8">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Protein */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Protein</Label>
            <span className="text-sm text-muted-foreground">
              {nutrition.protein} / {nutrition.targetProtein} g
            </span>
          </div>
          <Progress value={Math.min(proteinProgress, 100)} className="h-2" />
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Protein (g)"
              value={proteinInput}
              onChange={(e) => setProteinInput(e.target.value)}
              className="text-sm h-8"
            />
            <Button onClick={addProtein} size="sm" className="h-8">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionTracker;
