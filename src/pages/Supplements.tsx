
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CheckCircle, Circle, Pill, Zap, Sun, Droplets, Shield, Activity, Dumbbell, Circle as CircleIcon, Settings } from "lucide-react";
import { supabaseStorageService } from "@/services/supabaseStorageService";
import { toast } from "@/components/ui/use-toast";

interface SupplementData {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  category: string;
  icon: string;
  color: string;
  taken: Record<string, boolean>;
}

interface AdvancedSupplementsSettings {
  enabled: boolean;
}

const Supplements = () => {
  const [supplements, setSupplements] = useState<SupplementData[]>([]);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSupplementsSettings>({ enabled: false });
  const [currentDate] = useState(new Date());

  useEffect(() => {
    loadSupplements();
    loadAdvancedSettings();
  }, []);

  const loadSupplements = async () => {
    try {
      const [supplementsData, completionsData] = await Promise.all([
        supabaseStorageService.getSupplements(),
        supabaseStorageService.getSupplementCompletions()
      ]);

      // Map supplements with their completion status
      const supplementsWithTaken = supplementsData.map(supplement => {
        const taken: Record<string, boolean> = {};
        completionsData
          .filter(completion => completion.supplement_id === supplement.id)
          .forEach(completion => {
            taken[completion.date] = completion.taken || false;
          });

        return {
          id: supplement.id!,
          name: supplement.name,
          dosage: supplement.dosage,
          timing: supplement.timing,
          category: supplement.category,
          icon: supplement.icon,
          color: supplement.color,
          taken
        };
      });

      setSupplements(supplementsWithTaken);
    } catch (error) {
      console.error('Error loading supplements:', error);
    }
  };

  const loadAdvancedSettings = () => {
    const stored = localStorage.getItem('advancedSupplementsSettings');
    if (stored) {
      setAdvancedSettings(JSON.parse(stored));
    }
  };

  const toggleSupplement = async (supplementId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const supplement = supplements.find(s => s.id === supplementId);
    if (!supplement) return;

    const wasTaken = supplement.taken[today] || false;
    const newTakenStatus = !wasTaken;

    try {
      await supabaseStorageService.saveSupplementCompletions([{
        supplement_id: supplementId,
        date: today,
        taken: newTakenStatus
      }]);

      // Update local state
      setSupplements(prev => prev.map(s => 
        s.id === supplementId 
          ? { ...s, taken: { ...s.taken, [today]: newTakenStatus } }
          : s
      ));

      toast({
        title: newTakenStatus ? "Supplement eingenommen" : "Einnahme rückgängig",
        description: `${supplement.name} für heute ${newTakenStatus ? 'als eingenommen markiert' : 'zurückgesetzt'}.`,
      });
    } catch (error) {
      console.error('Error toggling supplement:', error);
      toast({
        title: "Fehler",
        description: "Supplement-Status konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  };

  const toggleAdvancedSupplements = (enabled: boolean) => {
    const newSettings = { enabled };
    setAdvancedSettings(newSettings);
    localStorage.setItem('advancedSupplementsSettings', JSON.stringify(newSettings));
    
    toast({
      title: enabled ? "Ergänzungsmittel aktiviert" : "Ergänzungsmittel deaktiviert",
      description: enabled ? "Erweiterte Ergänzungsmittel sind jetzt sichtbar." : "Erweiterte Ergänzungsmittel wurden ausgeblendet.",
    });
  };

  const isSupplementTaken = (supplementId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const supplement = supplements.find(s => s.id === supplementId);
    return supplement?.taken[today] || false;
  };

  const getSupplementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="h-4 w-4" />;
      case 'Sun': return <Sun className="h-4 w-4" />;
      case 'Droplet': return <Droplets className="h-4 w-4" />;
      case 'Shield': return <Shield className="h-4 w-4" />;
      case 'Activity': return <Activity className="h-4 w-4" />;
      case 'Dumbbell': return <Dumbbell className="h-4 w-4" />;
      case 'Citrus': return <CircleIcon className="h-4 w-4" />;
      default: return <Pill className="h-4 w-4" />;
    }
  };

  const categorizedSupplements = {
    basic: supplements.filter(s => s.category === 'basic'),
    performance: supplements.filter(s => s.category === 'performance'),
    health: supplements.filter(s => s.category === 'health'),
    recovery: supplements.filter(s => s.category === 'recovery'),
    advanced: supplements.filter(s => s.category === 'advanced')
  };

  const categoryLabels = {
    basic: 'Grundlagen',
    performance: 'Performance',
    health: 'Gesundheit',
    recovery: 'Regeneration',
    advanced: 'Ergänzungsmittel'
  };

  const regularSupplements = supplements.filter(s => s.category !== 'advanced');
  const todayTaken = regularSupplements.filter(s => isSupplementTaken(s.id)).length;
  const totalSupplements = regularSupplements.length;

  const advancedTodayTaken = categorizedSupplements.advanced.filter(s => isSupplementTaken(s.id)).length;
  const totalAdvanced = categorizedSupplements.advanced.length;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Supplements
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Verfolge deine tägliche Supplementeinnahme
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {todayTaken}/{totalSupplements} heute eingenommen
          </Badge>
        </div>
      </div>

      {/* Advanced Supplements Toggle */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Erweiterte Ergänzungsmittel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Ergänzungsmittel aktivieren</p>
              <p className="text-xs text-muted-foreground">
                Zeige erweiterte Ergänzungsmittel (MK-677, Epicatechin, etc.)
              </p>
            </div>
            <Switch
              checked={advancedSettings.enabled}
              onCheckedChange={toggleAdvancedSupplements}
            />
          </div>
        </CardContent>
      </Card>

      {/* Today's Overview */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Heute - {format(new Date(), "dd.MM.yyyy", { locale: de })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {regularSupplements.map((supplement) => (
              <div
                key={supplement.id}
                className={`
                  glass-card rounded-xl p-3 border transition-all cursor-pointer hover:scale-105
                  ${isSupplementTaken(supplement.id) 
                    ? 'border-green-500/50 bg-green-500/10' 
                    : 'border-primary/20'
                  }
                `}
                onClick={() => toggleSupplement(supplement.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-full border"
                      style={{ 
                        backgroundColor: `${supplement.color}20`,
                        borderColor: `${supplement.color}50`
                      }}
                    >
                      {getSupplementIcon(supplement.icon)}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{supplement.name}</h4>
                      <p className="text-xs text-muted-foreground">{supplement.dosage}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {isSupplementTaken(supplement.id) ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  {supplement.timing}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Supplements Section */}
      {advancedSettings.enabled && totalAdvanced > 0 && (
        <Card className="glass-card border-purple-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-purple-400">
                {categoryLabels.advanced}
              </CardTitle>
              <Badge variant="outline" className="text-sm border-purple-500/30">
                {advancedTodayTaken}/{totalAdvanced} heute eingenommen
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categorizedSupplements.advanced.map((supplement) => (
                <div
                  key={supplement.id}
                  className={`
                    glass-card rounded-xl p-3 border transition-all cursor-pointer hover:scale-105
                    ${isSupplementTaken(supplement.id) 
                      ? 'border-purple-500/50 bg-purple-500/10' 
                      : 'border-purple-500/20'
                    }
                  `}
                  onClick={() => toggleSupplement(supplement.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-full border"
                        style={{ 
                          backgroundColor: `${supplement.color}20`,
                          borderColor: `${supplement.color}50`
                        }}
                      >
                        {getSupplementIcon(supplement.icon)}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{supplement.name}</h4>
                        <p className="text-xs text-muted-foreground">{supplement.dosage}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {isSupplementTaken(supplement.id) ? (
                        <CheckCircle className="h-5 w-5 text-purple-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    {supplement.timing}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {Object.entries(categorizedSupplements).map(([category, sups]) => {
        if (sups.length === 0 || category === 'advanced') return null;
        
        return (
          <Card key={category} className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sups.map((supplement) => (
                  <div
                    key={supplement.id}
                    className="glass-card rounded-xl p-3 border border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-full border"
                        style={{ 
                          backgroundColor: `${supplement.color}20`,
                          borderColor: `${supplement.color}50`
                        }}
                      >
                        {getSupplementIcon(supplement.icon)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{supplement.name}</h4>
                        <p className="text-sm text-muted-foreground">{supplement.dosage}</p>
                        <p className="text-xs text-muted-foreground">{supplement.timing}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Supplements;
