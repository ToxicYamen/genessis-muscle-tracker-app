
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ImagePlus, Calendar, Tag, Heart, Trash2 } from "lucide-react";
import { supabaseStorageService } from "@/services/supabaseStorageService";
import { toast } from "@/components/ui/use-toast";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface ProgressImage {
  id: string;
  date: string;
  time: string;
  image_url: string;
  tags: string[];
  notes?: string;
  is_favorite: boolean;
}

const Gallery = () => {
  const [images, setImages] = useState<ProgressImage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ProgressImage | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();

  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm"),
    notes: "",
    tags: "",
    imageFile: null as File | null
  });

  useEffect(() => {
    if (user) {
      loadImages();
    }
  }, [user]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const progressImages = await supabaseStorageService.getProgressImages();
      
      const formattedImages = progressImages.map(img => ({
        id: img.id!,
        date: img.date,
        time: img.time,
        image_url: img.image_url,
        tags: img.tags || [],
        notes: img.description,
        is_favorite: img.is_favorite || false
      }));
      
      setImages(formattedImages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error loading images:', error);
      toast({
        title: "Fehler",
        description: "Bilder konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageFile) {
      toast({
        title: "Fehler",
        description: "Bitte wähle ein Bild aus.",
        variant: "destructive"
      });
      return;
    }

    try {
      // For demo purposes, we'll use a placeholder URL
      // In a real implementation, you would upload to Supabase Storage
      const imageUrl = URL.createObjectURL(formData.imageFile);
      
      const newImage = {
        date: formData.date,
        time: formData.time,
        image_url: imageUrl,
        description: formData.notes,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        is_favorite: false
      };

      await supabaseStorageService.saveProgressImages([newImage]);
      
      toast({
        title: "Bild hochgeladen",
        description: "Dein Fortschrittsbild wurde erfolgreich gespeichert.",
      });

      setFormData({
        date: format(new Date(), "yyyy-MM-dd"),
        time: format(new Date(), "HH:mm"),
        notes: "",
        tags: "",
        imageFile: null
      });
      
      setIsDialogOpen(false);
      await loadImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Fehler",
        description: "Bild konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = async (imageId: string) => {
    try {
      const image = images.find(img => img.id === imageId);
      if (!image) return;

      const updatedImage = {
        id: image.id,
        date: image.date,
        time: image.time,
        image_url: image.image_url,
        description: image.notes,
        tags: image.tags,
        is_favorite: !image.is_favorite
      };

      await supabaseStorageService.saveProgressImages([updatedImage]);
      await loadImages();
      
      toast({
        title: updatedImage.is_favorite ? "Zu Favoriten hinzugefügt" : "Aus Favoriten entfernt",
        description: "Favorit wurde aktualisiert.",
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Fehler",
        description: "Favorit konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Bitte melde dich an, um deine Fortschrittsbilder zu sehen.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Lade Bilder...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Fortschrittsgalerie
          </h2>
          <p className="text-muted-foreground">Dokumentiere deinen Fortschritt mit Bildern</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <ImagePlus className="mr-2 h-4 w-4" />
              Bild hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Neues Fortschrittsbild</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleImageUpload} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Datum</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Zeit</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Bild</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData(prev => ({ ...prev, imageFile: e.target.files?.[0] || null }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (kommagetrennt)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="z.B. front, morning, workout"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notizen (optional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Zusätzliche Informationen..."
                />
              </div>
              
              <Button type="submit" className="w-full">
                Bild speichern
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Keine Bilder</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Füge dein erstes Fortschrittsbild hinzu.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <Card key={image.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(image.date), "dd.MM.yyyy", { locale: de })} um {image.time}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(image.id)}
                    className={image.is_favorite ? "text-red-500" : "text-muted-foreground"}
                  >
                    <Heart className={`h-4 w-4 ${image.is_favorite ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div 
                  className="aspect-square rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${image.image_url})` }}
                />
                
                {image.tags && image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {image.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {image.notes && (
                  <p className="text-sm text-muted-foreground">{image.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
