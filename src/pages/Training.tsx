
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Training = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Training</h2>
        <p className="text-muted-foreground">
          Verwalte deine Trainingseinheiten und Pläne.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trainingsplan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Trainingsmodul wird bald verfügbar sein.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Training;
