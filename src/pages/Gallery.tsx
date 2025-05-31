
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CameraIcon, PlusIcon, TrashIcon, ImageIcon } from "lucide-react";
import { storageService, ProgressImage } from "@/services/storageService";
import { toast } from "@/components/ui/use-toast";

const Gallery = () => {
  const [images, setImages] = useState<ProgressImage[]>(() => storageService.getProgressImages());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Bitte wähle ein Bild unter 5MB aus.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      const now = new Date();
      
      const newImage: ProgressImage = {
        id: `img_${Date.now()}`,
        date: format(now, "yyyy-MM-dd"),
        time: format(now, "HH:mm:ss"),
        image: imageData,
        notes: notes.trim() || undefined
      };

      storageService.saveProgressImage(newImage);
      setImages(storageService.getProgressImages());
      setNotes("");
      setIsDialogOpen(false);
      
      toast({
        title: "Bild hochgeladen",
        description: `Progress-Foto vom ${format(now, "dd.MM.yyyy 'um' HH:mm", { locale: de })} gespeichert.`,
      });
    };

    reader.readAsDataURL(file);
  };

  const deleteImage = (id: string) => {
    storageService.deleteProgressImage(id);
    setImages(storageService.getProgressImages());
    
    toast({
      title: "Bild gelöscht",
      description: "Das Progress-Foto wurde erfolgreich entfernt.",
    });
  };

  const groupedImages = images.reduce((groups, image) => {
    const monthKey = format(new Date(image.date), "yyyy-MM");
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(image);
    return groups;
  }, {} as Record<string, ProgressImage[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Progress Galerie
          </h2>
          <p className="text-muted-foreground">
            Dokumentiere deine körperliche Transformation
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 rounded-full glass-card border border-primary/30">
              <CameraIcon className="h-4 w-4" />
              Foto hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>Neues Progress-Foto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Foto auswählen</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="glass-card border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notizen (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Wie fühlst du dich? Besondere Erfolge?"
                  className="glass-card border-primary/20"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Datum und Uhrzeit werden automatisch hinzugefügt
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {images.length === 0 ? (
        <Card className="glass-card card-hover">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Noch keine Fotos</h3>
            <p className="text-muted-foreground text-center mb-4">
              Beginne deine Transformation zu dokumentieren
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="rounded-full border border-primary/30"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Erstes Foto hinzufügen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedImages)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([monthKey, monthImages], groupIndex) => (
              <div key={monthKey} className="animate-slide-in" style={{ animationDelay: `${groupIndex * 0.1}s` }}>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  {format(new Date(monthKey + "-01"), "MMMM yyyy", { locale: de })}
                </h3>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {monthImages
                    .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())
                    .map((image, index) => (
                      <Card 
                        key={image.id} 
                        className="glass-card card-hover animate-scale-in"
                        style={{ animationDelay: `${(groupIndex * monthImages.length + index) * 0.05}s` }}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex justify-between items-center">
                            <span>
                              {format(new Date(image.date), "dd.MM.yyyy", { locale: de })}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-normal">
                                {image.time}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteImage(image.id)}
                                className="h-6 w-6 text-destructive hover:bg-destructive/10"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="aspect-square overflow-hidden rounded-lg border border-primary/20 mb-3">
                            <img
                              src={image.image}
                              alt={`Progress vom ${image.date}`}
                              className="w-full h-full object-cover transition-transform hover:scale-105"
                            />
                          </div>
                          {image.notes && (
                            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border border-border/50">
                              {image.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  }
                </div>
              </div>
            ))
          }
        </div>
      )}

      {images.length > 0 && (
        <Card className="glass-card border border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Gesamt: {images.length} Progress-Foto{images.length !== 1 ? 's' : ''}
              </span>
              <span className="text-muted-foreground">
                Letzte Aufnahme: {format(new Date(`${images[0]?.date} ${images[0]?.time}`), "dd.MM.yyyy 'um' HH:mm", { locale: de })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Gallery;
