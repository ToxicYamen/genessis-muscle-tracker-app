
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FlashcardDrill = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Flashcards</h2>
        <p className="text-muted-foreground">
          Lerne mit Karteikarten.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flashcard System</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Flashcard-System wird bald verfügbar sein.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlashcardDrill;
