import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { 
  CameraIcon, 
  PlusIcon, 
  TrashIcon, 
  ImageIcon, 
  HeartIcon, 
  FilterIcon,
  GridIcon,
  CalendarIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon
} from "lucide-react";
import { storageService, ProgressImage } from "@/services/storageService";
import { toast } from "@/components/ui/use-toast";

const Gallery = () => {
  const [images, setImages] = useState<ProgressImage[]>(() => storageService.getProgressImages());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "favorites" | "recent">("all");
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
        notes: notes.trim() || undefined,
        isFavorite: false,
        tags: []
      };

      storageService.saveProgressImage(newImage);
      setImages(storageService.getProgressImages());
      setNotes("");
      setIsDialogOpen(false);
      
      toast({
        title: "📸 Bild hochgeladen",
        description: `Progress-Foto vom ${format(now, "dd.MM.yyyy 'um' HH:mm", { locale: de })} gespeichert.`,
      });
    };

    reader.readAsDataURL(file);
  };

  const deleteImage = (id: string) => {
    storageService.deleteProgressImage(id);
    setImages(storageService.getProgressImages());
    setSelectedImageIndex(null);
    
    toast({
      title: "🗑️ Bild gelöscht",
      description: "Das Progress-Foto wurde erfolgreich entfernt.",
    });
  };

  const toggleFavorite = (id: string) => {
    storageService.toggleImageFavorite(id);
    setImages(storageService.getProgressImages());
    
    const image = images.find(img => img.id === id);
    toast({
      title: image?.isFavorite ? "💙 Favorit entfernt" : "❤️ Als Favorit markiert",
      description: image?.isFavorite ? "Foto ist nicht mehr favorisiert" : "Foto zu Favoriten hinzugefügt",
    });
  };

  const filteredImages = images.filter(image => {
    // Search filter
    if (searchTerm && !image.notes?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Category filter
    switch (filterBy) {
      case "favorites":
        return image.isFavorite;
      case "recent":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(image.date) >= weekAgo;
      default:
        return true;
    }
  });

  const groupedImages = filteredImages.reduce((groups, image) => {
    const monthKey = format(new Date(image.date), "yyyy-MM");
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(image);
    return groups;
  }, {} as Record<string, ProgressImage[]>);

  const favoriteImages = images.filter(img => img.isFavorite);

  // Navigation functions for fullscreen view
  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;
    
    const newIndex = direction === 'prev' 
      ? (selectedImageIndex - 1 + filteredImages.length) % filteredImages.length
      : (selectedImageIndex + 1) % filteredImages.length;
    
    setSelectedImageIndex(newIndex);
  };

  const openImageFullscreen = (image: ProgressImage) => {
    const index = filteredImages.findIndex(img => img.id === image.id);
    setSelectedImageIndex(index);
  };

  const closeFullscreen = () => {
    setSelectedImageIndex(null);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedImageIndex === null) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        navigateImage('prev');
        break;
      case 'ArrowRight':
        navigateImage('next');
        break;
      case 'Escape':
        closeFullscreen();
        break;
    }
  };

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex]);

  const selectedImage = selectedImageIndex !== null ? filteredImages[selectedImageIndex] : null;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            📸 Progress Galerie
          </h2>
          <p className="text-muted-foreground">
            Dokumentiere deine körperliche Transformation
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 rounded-full glass-card border border-primary/30 btn-modern">
                <CameraIcon className="h-4 w-4" />
                Foto hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-enhanced">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CameraIcon className="h-5 w-5 text-primary" />
                  Neues Progress-Foto
                </DialogTitle>
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
                    className="glass-card border-primary/20 focus-enhanced"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notizen (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Wie fühlst du dich? Besondere Erfolge?"
                    className="glass-card border-primary/20 focus-enhanced"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  📅 Datum und Uhrzeit werden automatisch hinzugefügt
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card card-hover">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{images.length}</div>
            <p className="text-xs text-muted-foreground">Gesamt Fotos</p>
          </CardContent>
        </Card>
        <Card className="glass-card card-hover">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-400">{favoriteImages.length}</div>
            <p className="text-xs text-muted-foreground">Favoriten</p>
          </CardContent>
        </Card>
        <Card className="glass-card card-hover">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {images.filter(img => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(img.date) >= weekAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Diese Woche</p>
          </CardContent>
        </Card>
        <Card className="glass-card card-hover">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">
              {Object.keys(groupedImages).length}
            </div>
            <p className="text-xs text-muted-foreground">Monate</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Controls */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 flex-1">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Notizen durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-card border-primary/20 focus-enhanced"
          />
        </div>
        
        <Tabs value={filterBy} onValueChange={(value) => setFilterBy(value as any)} className="w-auto">
          <TabsList className="glass-card">
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="favorites">❤️ Favoriten</TabsTrigger>
            <TabsTrigger value="recent">🕒 Aktuell</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Gallery Content */}
      {filteredImages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card card-hover">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || filterBy !== "all" ? "Keine Fotos gefunden" : "Noch keine Fotos"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || filterBy !== "all" 
                  ? "Versuche einen anderen Filter oder Suchbegriff" 
                  : "Beginne deine Transformation zu dokumentieren"
                }
              </p>
              {!searchTerm && filterBy === "all" && (
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="rounded-full border border-primary/30 btn-modern"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Erstes Foto hinzufügen
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-8">
          <AnimatePresence>
            {Object.entries(groupedImages)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([monthKey, monthImages], groupIndex) => (
                <motion.div 
                  key={monthKey}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ delay: groupIndex * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold text-primary">
                      {format(new Date(monthKey + "-01"), "MMMM yyyy", { locale: de })}
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent"></div>
                    <span className="text-sm text-muted-foreground">
                      {monthImages.length} Foto{monthImages.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence>
                      {monthImages
                        .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())
                        .map((image, index) => (
                          <motion.div
                            key={image.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -5 }}
                          >
                            <Card className="glass-card interactive-card overflow-hidden">
                              <div className="relative">
                                <div className="aspect-square overflow-hidden">
                                  <motion.img
                                    src={image.image}
                                    alt={`Progress vom ${image.date}`}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => openImageFullscreen(image)}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                  />
                                </div>
                                
                                {/* Overlay Controls */}
                                <div className="absolute top-2 right-2 flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleFavorite(image.id)}
                                    className={`h-8 w-8 rounded-full glass-card ${
                                      image.isFavorite 
                                        ? 'text-red-400 bg-red-400/20' 
                                        : 'text-white/70 hover:text-red-400'
                                    }`}
                                  >
                                    <HeartIcon className={`h-4 w-4 ${image.isFavorite ? 'fill-current' : ''}`} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteImage(image.id)}
                                    className="h-8 w-8 rounded-full glass-card text-white/70 hover:text-red-400 hover:bg-red-400/20"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </div>

                                {/* Date Badge */}
                                <div className="absolute bottom-2 left-2">
                                  <div className="glass-card px-2 py-1 rounded-full text-xs text-white/90">
                                    {format(new Date(image.date), "dd.MM.yyyy", { locale: de })}
                                  </div>
                                </div>
                              </div>
                              
                              {image.notes && (
                                <CardContent className="p-3">
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {image.notes}
                                  </p>
                                </CardContent>
                              )}
                            </Card>
                          </motion.div>
                        ))
                      }
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))
            }
          </AnimatePresence>
        </div>
      )}

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={closeFullscreen}
          >
            <div className="relative max-w-screen-lg max-h-screen-lg w-full h-full flex items-center justify-center p-4">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeFullscreen}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              >
                <XIcon className="h-6 w-6" />
              </Button>

              {/* Navigation Buttons */}
              {filteredImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage('prev');
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage('next');
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Image */}
              <motion.img
                src={selectedImage.image}
                alt={`Progress vom ${selectedImage.date}`}
                className="max-w-full max-h-full object-contain"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              />

              {/* Image Info */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {format(new Date(selectedImage.date), "dd.MM.yyyy", { locale: de })} • {selectedImage.time}
                    </h3>
                    {selectedImage.notes && (
                      <p className="text-sm text-white/80 mt-1">{selectedImage.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedImage.isFavorite && (
                      <HeartIcon className="h-5 w-5 text-red-400 fill-current" />
                    )}
                    <span className="text-sm text-white/60">
                      {(selectedImageIndex || 0) + 1} / {filteredImages.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Gallery;
