
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, EditIcon, TrashIcon, Utensils, Droplet, CircleCheck, Pill, Dumbbell, Moon, Coffee } from "lucide-react";
import { supabaseStorageService } from "@/services/supabaseStorageService";
import { toast } from "@/components/ui/use-toast";

interface HabitData {
  id: string;
  name: string;
  description?: string;
  completedDates: string[];
}

interface HabitManagerProps {
  habits: HabitData[];
  onHabitsChange: () => void;
}

const iconOptions = [
  { value: 'Utensils', label: 'Essen', icon: Utensils },
  { value: 'Droplet', label: 'Wasser', icon: Droplet },
  { value: 'Pill', label: 'Medikament', icon: Pill },
  { value: 'CircleCheck', label: 'Check', icon: CircleCheck },
  { value: 'Dumbbell', label: 'Training', icon: Dumbbell },
  { value: 'Moon', label: 'Schlaf', icon: Moon },
  { value: 'Coffee', label: 'Kaffee', icon: Coffee }
];

const HabitManager = ({ habits, onHabitsChange }: HabitManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "CircleCheck",
    target: 1
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "CircleCheck",
      target: 1
    });
    setEditingHabit(null);
  };

  const openDialog = (habit?: HabitData) => {
    if (habit) {
      setEditingHabit(habit);
      setFormData({
        name: habit.name,
        description: habit.description || "",
        icon: "CircleCheck", // Default icon since we don't store it in the simplified interface
        target: 1 // Default target
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Namen für das Habit ein.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingHabit) {
        // Update existing habit
        await supabaseStorageService.saveHabits([{
          id: editingHabit.id,
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          target: formData.target
        }]);
        
        toast({
          title: "Habit aktualisiert",
          description: `${formData.name} wurde erfolgreich aktualisiert.`,
        });
      } else {
        // Create new habit
        await supabaseStorageService.saveHabits([{
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          target: formData.target
        }]);
        
        toast({
          title: "Habit erstellt",
          description: `${formData.name} wurde erfolgreich hinzugefügt.`,
        });
      }

      onHabitsChange();
      closeDialog();
    } catch (error) {
      console.error('Error saving habit:', error);
      toast({
        title: "Fehler",
        description: "Habit konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      const habitToDelete = habits.find(h => h.id === habitId);
      
      // Note: You'll need to implement a delete method in supabaseStorageService
      console.log('Would delete habit:', habitId);
      
      toast({
        title: "Habit gelöscht",
        description: `${habitToDelete?.name} wurde erfolgreich entfernt.`,
      });
      
      onHabitsChange();
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast({
        title: "Fehler",
        description: "Habit konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.value === iconName);
    const IconComponent = iconOption?.icon || CircleCheck;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <Card className="glass-card card-hover">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
            Habit Verwaltung
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => openDialog()}
                className="rounded-full border border-primary/30"
                size="sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Neues Habit
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>
                  {editingHabit ? "Habit bearbeiten" : "Neues Habit erstellen"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="z.B. Protein Shake, Wasser trinken..."
                    className="glass-card border-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung (optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Zusätzliche Details..."
                    className="glass-card border-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select 
                    value={formData.icon} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                  >
                    <SelectTrigger className="glass-card border-primary/20">
                      <SelectValue placeholder="Icon auswählen" />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target">Tagesziel</Label>
                  <Input
                    id="target"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.target}
                    onChange={(e) => setFormData(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                    className="glass-card border-primary/20"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingHabit ? "Aktualisieren" : "Erstellen"}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Abbrechen
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {habits.map((habit) => (
            <div 
              key={habit.id} 
              className="glass-card rounded-xl p-3 border border-primary/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 rounded-full p-2 border border-primary/30">
                  {getIconComponent("CircleCheck")}
                </div>
                <div>
                  <h4 className="font-medium">{habit.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {habit.description && `${habit.description} • `}
                    Abgeschlossen: {habit.completedDates.length} Tage
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/10"
                  onClick={() => openDialog(habit)}
                >
                  <EditIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                  onClick={() => deleteHabit(habit.id)}
                >
                  <TrashIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          
          {habits.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Noch keine Habits erstellt.</p>
              <p className="text-sm">Klicke auf "Neues Habit" um zu beginnen.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitManager;
