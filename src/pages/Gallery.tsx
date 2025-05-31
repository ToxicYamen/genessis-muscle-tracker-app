
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, GalleryHorizontalIcon, ImageIcon, PlusIcon, UploadIcon, Camera } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ProgressImage {
  id: string;
  date: Date;
  time: string;
  images: string[];
  notes: string;
  type: 'front' | 'side' | 'back' | 'pose';
}

const Gallery = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTab, setSelectedTab] = useState("calendar");
  const [uploadImages, setUploadImages] = useState<string[]>([]);
  const [uploadNotes, setUploadNotes] = useState("");
  
  const [checkIns, setCheckIns] = useState<ProgressImage[]>([
    {
      id: "1",
      date: new Date(2025, 6, 15),
      time: "08:30",
      images: ["/placeholder.svg", "/placeholder.svg"],
      notes: "Erstes Check-in: Guter Start, Bizeps zeigt Entwicklung",
      type: 'front'
    },
    {
      id: "2", 
      date: new Date(2025, 6, 30),
      time: "09:15",
      images: ["/placeholder.svg"],
      notes: "Leichte Verbesserung sichtbar, Schultern definierter",
      type: 'side'
    },
  ]);
  
  // Find check-in for selected date
  const selectedCheckIn = selectedDate 
    ? checkIns.find(ci => 
        ci.date.getDate() === selectedDate.getDate() &&
        ci.date.getMonth() === selectedDate.getMonth() &&
        ci.date.getFullYear() === selectedDate.getFullYear()
      )
    : undefined;

  // Get dates that have check-ins
  const checkInDates = checkIns.map(ci => ci.date);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            if (newImages.length === files.length) {
              setUploadImages(prev => [...prev, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const saveProgressImages = () => {
    if (!selectedDate || uploadImages.length === 0) {
      toast({
        title: "Fehler",
        description: "Bitte wähle ein Datum und lade mindestens ein Bild hoch.",
        variant: "destructive"
      });
      return;
    }

    const currentTime = format(new Date(), "HH:mm");
    const newCheckIn: ProgressImage = {
      id: Date.now().toString(),
      date: selectedDate,
      time: currentTime,
      images: uploadImages,
      notes: uploadNotes,
      type: 'front'
    };

    setCheckIns(prev => [...prev, newCheckIn].sort((a, b) => 
      a.date.getTime() - b.date.getTime()
    ));

    setUploadImages([]);
    setUploadNotes("");

    toast({
      title: "Progress gespeichert",
      description: `Neue Bilder für ${format(selectedDate, "dd.MM.yyyy")} um ${currentTime} Uhr hinzugefügt.`,
    });
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Progress Galerie</h2>
          <p className="text-muted-foreground">Dokumentiere und verfolge deine körperlichen Veränderungen</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 rounded-lg">
                <CalendarIcon className="h-4 w-4" />
                {selectedDate ? format(selectedDate, "dd.MM.yyyy") : "Datum wählen"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-lg pointer-events-auto"
                modifiersStyles={{
                  selected: { backgroundColor: "white", color: "black" },
                }}
                modifiers={{
                  highlighted: checkInDates,
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs defaultValue="calendar" onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-lg">
          <TabsTrigger value="calendar" className="rounded-lg">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Kalender
          </TabsTrigger>
          <TabsTrigger value="gallery" className="rounded-lg">
            <GalleryHorizontalIcon className="h-4 w-4 mr-2" />
            Galerie
          </TabsTrigger>
          <TabsTrigger value="upload" className="rounded-lg">
            <UploadIcon className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <Card className="shadow-md animate-scale-in">
            <CardHeader>
              <CardTitle>Progress Timeline</CardTitle>
              <CardDescription>Juli 2025 bis Juli 2029</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex flex-col">
                  <h3 className="text-lg font-medium mb-2">Ausgewähltes Datum: {selectedDate ? format(selectedDate, "dd.MM.yyyy") : "Kein Datum ausgewählt"}</h3>
                  
                  {selectedCheckIn ? (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <p>{selectedCheckIn.notes}</p>
                        <span className="text-sm text-muted-foreground">{selectedCheckIn.time} Uhr</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {selectedCheckIn.images.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-muted hover:opacity-90 transition-opacity card-hover">
                            <img 
                              src={img} 
                              alt={`Progress vom ${format(selectedCheckIn.date, "dd.MM.yyyy")} um ${selectedCheckIn.time}`} 
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
                      <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">Kein Progress an diesem Datum</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Wechsle zum Upload-Tab, um für diesen Tag Progress-Bilder zu erstellen.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <Card className="shadow-md animate-scale-in">
            <CardHeader>
              <CardTitle>Alle Progress-Bilder</CardTitle>
              <CardDescription>Chronologische Übersicht deiner Transformation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {checkIns.map(checkIn => (
                  <div key={checkIn.id} className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{format(checkIn.date, "dd.MM.yyyy")}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{checkIn.time} Uhr</span>
                        <Button variant="outline" size="sm" className="rounded-lg">Details</Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{checkIn.notes}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {checkIn.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-muted hover:opacity-90 transition-opacity card-hover">
                          <img 
                            src={img} 
                            alt={`Progress vom ${format(checkIn.date, "dd.MM.yyyy")} um ${checkIn.time}`} 
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <Card className="shadow-md animate-scale-in">
            <CardHeader>
              <CardTitle>Progress-Bilder hochladen</CardTitle>
              <CardDescription>Dokumentiere deinen heutigen Progress mit Datum und Uhrzeit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-upload" className="text-sm font-medium">Bilder auswählen</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-1 rounded-lg"
                  />
                </div>

                {uploadImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img src={img} alt={`Upload ${idx + 1}`} className="object-cover w-full h-full" />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 rounded-lg"
                          onClick={() => setUploadImages(prev => prev.filter((_, i) => i !== idx))}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">Notizen (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Beschreibe deine Fortschritte, Gefühle oder Beobachtungen..."
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    className="mt-1 rounded-lg"
                    rows={3}
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Datum:</strong> {selectedDate ? format(selectedDate, "dd.MM.yyyy") : "Nicht ausgewählt"}<br />
                    <strong>Uhrzeit:</strong> {format(new Date(), "HH:mm")} Uhr<br />
                    <strong>Bilder:</strong> {uploadImages.length} ausgewählt
                  </p>
                </div>

                <Button onClick={saveProgressImages} className="w-full rounded-lg" disabled={uploadImages.length === 0}>
                  <Camera className="h-4 w-4 mr-2" />
                  Progress speichern
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Gallery;
