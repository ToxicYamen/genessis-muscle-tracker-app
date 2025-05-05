
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, GalleryHorizontalIcon, ImageIcon, PlusIcon } from "lucide-react";

// Sample image check-in data
const checkIns = [
  {
    id: 1,
    date: new Date(2025, 6, 15),
    images: ["/placeholder.svg", "/placeholder.svg"],
    notes: "Erstes Check-in: Guter Start, Bizeps zeigt Entwicklung"
  },
  {
    id: 2,
    date: new Date(2025, 6, 30),
    images: ["/placeholder.svg"],
    notes: "Leichte Verbesserung sichtbar, Schultern definierter"
  },
];

const Gallery = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTab, setSelectedTab] = useState("calendar");
  
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
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Progress Gallery</h2>
          <p className="text-muted-foreground">Dokumentiere und verfolge deine körperlichen Veränderungen</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 rounded-full">
                <CalendarIcon className="h-4 w-4" />
                {selectedDate ? format(selectedDate, "dd.MM.yyyy") : "Datum wählen"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md pointer-events-auto"
                modifiersStyles={{
                  selected: { backgroundColor: "black", color: "white" },
                }}
                modifiers={{
                  highlighted: checkInDates,
                }}
              />
            </PopoverContent>
          </Popover>
          
          <Button className="rounded-full">
            <PlusIcon className="h-4 w-4 mr-2" />
            Neues Check-in
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-full">
          <TabsTrigger value="calendar" className="rounded-full">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Kalender
          </TabsTrigger>
          <TabsTrigger value="gallery" className="rounded-full">
            <GalleryHorizontalIcon className="h-4 w-4 mr-2" />
            Galerie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <Card className="shadow-md animate-scale-in">
            <CardHeader>
              <CardTitle>4-Jahres-Plan</CardTitle>
              <CardDescription>Juli 2025 bis Juli 2029</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex flex-col">
                  <h3 className="text-lg font-medium mb-2">Ausgewähltes Datum: {selectedDate ? format(selectedDate, "dd.MM.yyyy") : "Kein Datum ausgewählt"}</h3>
                  
                  {selectedCheckIn ? (
                    <div className="space-y-4 animate-fade-in">
                      <p>{selectedCheckIn.notes}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {selectedCheckIn.images.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-muted hover:opacity-90 transition-opacity card-hover">
                            <img 
                              src={img} 
                              alt={`Check-in vom ${format(selectedCheckIn.date, "dd.MM.yyyy")}`} 
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
                      <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">Kein Check-in an diesem Datum</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Klicke auf "Neues Check-in", um für diesen Tag ein Check-in zu erstellen.
                      </p>
                      <Button className="mt-4 rounded-full">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Check-in hinzufügen
                      </Button>
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
              <CardTitle>Fortschrittsgalerie</CardTitle>
              <CardDescription>Alle Check-ins auf einen Blick</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {checkIns.map(checkIn => (
                  <div key={checkIn.id} className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{format(checkIn.date, "dd.MM.yyyy")}</h3>
                      <Button variant="outline" size="sm" className="rounded-full">Details</Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{checkIn.notes}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {checkIn.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-muted hover:opacity-90 transition-opacity card-hover">
                          <img 
                            src={img} 
                            alt={`Check-in vom ${format(checkIn.date, "dd.MM.yyyy")}`} 
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
      </Tabs>
    </div>
  );
};

export default Gallery;
