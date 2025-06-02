
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Utensils } from "lucide-react";
import { storageService, NutritionData } from "@/services/storageService";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const NutritionTracker = () => {
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
    loadNutrition();
  }, []);

  const loadNutrition = () => {
    const data = storageService.getNutrition(today);
    setNutrition(data);
  };

  const addCalories = () => {
    if (calorieInput && !isNaN(Number(calorieInput))) {
      const amount = Number(calorieInput);
      storageService.addNutritionValue(today, 'calories', amount);
      setCalorieInput("");
      loadNutrition();
      toast({
        title: "Kalorien hinzugefügt",
        description: `${amount} kcal wurden hinzugefügt.`,
      });
    }
  };

  const addProtein = () => {
    if (proteinInput && !isNaN(Number(proteinInput))) {
      const amount = Number(proteinInput);
      storageService.addNutritionValue(today, 'protein', amount);
      setProteinInput("");
      loadNutrition();
      toast({
        title: "Protein hinzugefügt",
        description: `${amount}g Protein wurden hinzugefügt.`,
      });
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
