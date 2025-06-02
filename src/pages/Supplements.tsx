
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Pill, Clock, CheckCircle, Circle, PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import { supabaseStorageService } from "@/services/supabaseStorageService";
import { toast } from "@/components/ui/use-toast";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface Supplement {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  category: string;
  icon: string;
  color: string;
}

interface SupplementCompletion {
  id?: string;
  supplement_id: string;
  date: string;
  taken: boolean;
}

const Supplements = () => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [completions, setCompletions] = useState<SupplementCompletion[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();

  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    timing: "morning",
    category: "vitamin",
    icon: "Pill",
    color: "blue"
  });

  useEffect(() => {
    if (user) {
      loadSupplements();
      loadCompletions();
    }
  }, [user]);

  const loadSupplements = async () => {
    try {
      setLoading(true);
      const supplementsData = await supabaseStorageService.getSupplements();
      setSupplements(supplementsData);
    } catch (error) {
      console.error('Error loading supplements:', error);
      toast({
        title: "Fehler",
        description: "Supplements konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCompletions = async () => {
    try {
      const completionsData = await supabaseStorageService.getSupplementCompletions();
      setCompletions(completionsData);
    } catch (error) {
      console.error('Error loading completions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Namen für das Supplement ein.",
        variant: "destructive"
      });
      return;
    }

    try {
      const supplementData = {
        id: editingSupplement?.id,
        name: formData.name,
        dosage: formData.dosage,
        timing: formData.timing,
        category: formData.category,
        icon: formData.icon,
        color: formData.color
      };

      await supabaseStorageService.saveSupplements([supplementData]);
      
      toast({
        title: editingSupplement ? "Supplement aktualisiert" : "Supplement erstellt",
        description: `${formData.name} wurde erfolgreich ${editingSupplement ? 'aktualisiert' : 'hinzugefügt'}.`,
      });

      resetForm();
      setIsDialogOpen(false);
      await loadSupplements();
    } catch (error) {
      console.error('Error saving supplement:', error);
      toast({
        title: "Fehler",
        description: "Supplement konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      dosage: "",
      timing: "morning",
      category: "vitamin",
      icon: "Pill",
      color: "blue"
    });
    setEditingSupplement(null);
  };

  const startEdit = (supplement: Supplement) => {
    setEditingSupplement(supplement);
    setFormData({
      name: supplement.name,
      dosage: supplement.dosage,
      timing: supplement.timing,
      category: supplement.category,
      icon: supplement.icon,
      color: supplement.color
    });
    setIsDialogOpen(true);
  };

  const toggleCompletion = async (supplementId: string) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const existingCompletion = completions.find(
        c => c.supplement_id === supplementId && c.date === today
      );

      if (existingCompletion) {
        // Update existing completion
        const updatedCompletion = {
          ...existingCompletion,
          taken: !existingCompletion.taken
        };
        await supabaseStorageService.saveSupplementCompletions([updatedCompletion]);
      } else {
        // Create new completion
        const newCompletion = {
          supplement_id: supplementId,
          date: today,
          taken: true
        };
        await supabaseStorageService.saveSupplementCompletions([newCompletion]);
      }

      await loadCompletions();
      
      const supplement = supplements.find(s => s.id === supplementId);
      toast({
        title: existingCompletion?.taken ? "Zurückgesetzt" : "Eingenommen",
        description: `${supplement?.name} für heute ${existingCompletion?.taken ? 'zurückgesetzt' : 'als eingenommen markiert'}.`,
      });
    } catch (error) {
      console.error('Error toggling completion:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden.",
        variant: "destructive",
      });
    }
  };

  const isCompletedToday = (supplementId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const completion = completions.find(
      c => c.supplement_id === supplementId && c.date === today
    );
    return completion?.taken || false;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Bitte melde dich an, um deine Supplements zu verwalten.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Lade Supplements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Supplements
          </h2>
          <p className="text-muted-foreground">Verwalte deine täglichen Supplements</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Neues Supplement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSupplement ? "Supplement bearbeiten" : "Neues Supplement"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="z.B. Vitamin D3"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosierung</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                  placeholder="z.B. 1000 IU"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timing">Einnahmezeit</Label>
                  <Select value={formData.timing} onValueChange={(value) => setFormData(prev => ({ ...prev, timing: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morgens</SelectItem>
                      <SelectItem value="noon">Mittags</SelectItem>
                      <SelectItem value="evening">Abends</SelectItem>
                      <SelectItem value="night">Nachts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Kategorie</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vitamin">Vitamin</SelectItem>
                      <SelectItem value="mineral">Mineral</SelectItem>
                      <SelectItem value="protein">Protein</SelectItem>
                      <SelectItem value="pre-workout">Pre-Workout</SelectItem>
                      <SelectItem value="post-workout">Post-Workout</SelectItem>
                      <SelectItem value="other">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                {editingSupplement ? "Aktualisieren" : "Hinzufügen"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {supplements.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Pill className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Keine Supplements</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Füge dein erstes Supplement hinzu.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {supplements.map((supplement) => (
            <Card key={supplement.id} className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{supplement.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(supplement)}
                    >
                      <EditIcon className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dosierung:</span>
                  <span className="text-sm font-medium">{supplement.dosage}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {supplement.timing === 'morning' && 'Morgens'}
                      {supplement.timing === 'noon' && 'Mittags'}
                      {supplement.timing === 'evening' && 'Abends'}
                      {supplement.timing === 'night' && 'Nachts'}
                    </span>
                  </div>
                  <Badge variant="outline">{supplement.category}</Badge>
                </div>
                
                <Button
                  onClick={() => toggleCompletion(supplement.id)}
                  variant={isCompletedToday(supplement.id) ? "default" : "outline"}
                  className="w-full"
                >
                  {isCompletedToday(supplement.id) ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Eingenommen
                    </>
                  ) : (
                    <>
                      <Circle className="mr-2 h-4 w-4" />
                      Als eingenommen markieren
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Supplements;
