
import { useTrackingData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Workout = () => {
  const { workoutSplit } = useTrackingData();
  
  // Get the current day of the week
  const today = new Date().getDay();
  // Convert to workout day index (0 = Monday, 5 = Saturday, Sunday = rest)
  const todayWorkoutIndex = today === 0 ? -1 : today - 1;
  const todayWorkout = todayWorkoutIndex >= 0 && todayWorkoutIndex < workoutSplit.length ? 
    workoutSplit[todayWorkoutIndex].day : "Sonntag";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Dein Arnold Split</h2>
        <Card className="w-full md:w-auto">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-muted-foreground">Heute:</span>
            <span className="font-medium">{todayWorkout}</span>
            {todayWorkoutIndex >= 0 && todayWorkoutIndex < workoutSplit.length && (
              <span className="ml-2">({workoutSplit[todayWorkoutIndex].focus})</span>
            )}
            {todayWorkoutIndex === -1 && <span className="ml-2">(Ruhetag)</span>}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={workoutSplit[0].day} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6">
          {workoutSplit.map((day) => (
            <TabsTrigger key={day.day} value={day.day}>
              {day.day}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {workoutSplit.map((day) => (
          <TabsContent key={day.day} value={day.day} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{day.day}: {day.focus}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-1">
                  {day.exercises.map((exercise, index) => (
                    <li key={index} className="text-sm md:text-base">
                      {exercise}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Training Empfehlungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Sätze und Wiederholungen</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Hypertrophie: 3-4 Sätze mit 8-12 Wiederholungen
              </p>
              <p className="text-sm text-muted-foreground">
                Kraft: 4-5 Sätze mit 4-6 Wiederholungen
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">Pausenzeiten</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Zwischen Sätzen: 60-90 Sekunden
              </p>
              <p className="text-sm text-muted-foreground">
                Zwischen Übungen: 2-3 Minuten
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">Intensitätstechniken</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Dropsets: Reduziere das Gewicht und trainiere direkt weiter
              </p>
              <p className="text-sm text-muted-foreground">
                Supersätze: Kombiniere zwei Übungen ohne Pause dazwischen
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Entwicklungsplan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Jahr 1 (19 Jahre)</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Fokus: Hypertrophie, 8-12 Wiederholungen, 3-4 Sätze
              </p>
              <p className="text-sm text-muted-foreground">
                Ziel: Progressive Laststeigerung, Grundlagen stabilisieren
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">Jahr 2 (20 Jahre)</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Fokus: Volumensteigerung, Supersätze, Dropsets
              </p>
              <p className="text-sm text-muted-foreground">
                Ziel: Trainingsfrequenz erhöhen, Isolationsübungen optimieren
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">Jahr 3 (21 Jahre)</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Fokus: Stärke & Dichte, 5-8 Wiederholungen, hohe Intensität
              </p>
              <p className="text-sm text-muted-foreground">
                Ziel: Maximalkraft blockweise entwickeln, Trainingsintensität steigern
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">Jahr 4 (22 Jahre)</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Fokus: Detailoptimierung, Zyklen mit Deload-Wochen
              </p>
              <p className="text-sm text-muted-foreground">
                Ziel: Körperproportionen feinschleifen, maximale Muskelreife erreichen
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Workout;
