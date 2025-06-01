
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CameraIcon, UserIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface PersonalData {
  name: string;
  age: number;
  height: number;
  weight: number;
  bodyFat: number;
  calories: number;
  protein: number;
  sleep: number;
  profileImage?: string;
}

const Profile = () => {
  const [personalData, setPersonalData] = useState<PersonalData>(() => {
    const saved = localStorage.getItem('personalData');
    return saved ? JSON.parse(saved) : {
      name: "",
      age: 18,
      height: 180,
      weight: 75,
      bodyFat: 12,
      calories: 4864,
      protein: 280,
      sleep: 8
    };
  });
  
  const [formData, setFormData] = useState<PersonalData>({...personalData});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const milestones = [
    { age: 18, weight: "75 kg", armSize: "35 cm", shoulderSize: "110 cm", bodyFat: "12%", note: "Ausgangspunkt - Natural Training" },
    { age: 19, weight: "82 kg", armSize: "38 cm", shoulderSize: "115 cm", bodyFat: "10%", note: "Jahr 1 - Grundlagen aufbauen" },
    { age: 20, weight: "88 kg", armSize: "41 cm", shoulderSize: "120 cm", bodyFat: "9%", note: "Jahr 2 - Kraft & Masse" },
    { age: 21, weight: "95 kg", armSize: "44 cm", shoulderSize: "125 cm", bodyFat: "8.5%", note: "Jahr 3 - Definition & Größe" },
    { age: 22, weight: "100 kg", armSize: "46 cm", shoulderSize: "130 cm", bodyFat: "8%", note: "Jahr 4 - Ziel erreicht!" }
  ];

  const updatePersonalData = (data: PersonalData) => {
    setPersonalData(data);
    localStorage.setItem('personalData', JSON.stringify(data));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === "name" ? value : parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePersonalData(formData);
    
    toast({
      title: "Profil aktualisiert",
      description: "Deine persönlichen Daten wurden erfolgreich gespeichert.",
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Bitte wähle ein Bild unter 2MB aus.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      const updatedData = { ...formData, profileImage: imageData };
      setFormData(updatedData);
      updatePersonalData(updatedData);
      
      toast({
        title: "Profilbild aktualisiert",
        description: "Dein Profilbild wurde erfolgreich hochgeladen.",
      });
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Mein Profil
          </h2>
          <p className="text-muted-foreground">Verwalte deine persönlichen Daten und Ziele</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Picture Section */}
        <Card className="glass-card card-hover animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle>Profilbild</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={personalData.profileImage} alt={personalData.name || "Profilbild"} />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {personalData.name ? personalData.name.charAt(0).toUpperCase() : <UserIcon className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-2 -right-2 rounded-full border-primary/30"
                onClick={() => fileInputRef.current?.click()}
              >
                <CameraIcon className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold">{personalData.name || "Dein Name"}</h3>
              <p className="text-muted-foreground">{personalData.age} Jahre</p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Data Form */}
        <Card className="md:col-span-2 glass-card card-hover animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle>Persönliche Daten</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Dein Name"
                    className="glass-card border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Alter</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Alter"
                    className="glass-card border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Größe (cm)</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="Größe in cm"
                    className="glass-card border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Gewicht (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="Gewicht in kg"
                    className="glass-card border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFat">Körperfett (%)</Label>
                  <Input
                    id="bodyFat"
                    name="bodyFat"
                    type="number"
                    step="0.1"
                    value={formData.bodyFat}
                    onChange={handleInputChange}
                    placeholder="Körperfett in %"
                    className="glass-card border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calories">Kalorien / Tag</Label>
                  <Input
                    id="calories"
                    name="calories"
                    type="number"
                    value={formData.calories}
                    onChange={handleInputChange}
                    placeholder="Täglicher Kalorienbedarf"
                    className="glass-card border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g/Tag)</Label>
                  <Input
                    id="protein"
                    name="protein"
                    type="number"
                    value={formData.protein}
                    onChange={handleInputChange}
                    placeholder="Täglicher Proteinbedarf"
                    className="glass-card border-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sleep">Schlaf (Stunden)</Label>
                  <Input
                    id="sleep"
                    name="sleep"
                    type="number"
                    step="0.5"
                    value={formData.sleep}
                    onChange={handleInputChange}
                    placeholder="Schlafstunden"
                    className="glass-card border-primary/20"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Daten speichern
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card card-hover animate-slide-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle>Ernährung & Supplements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Makros</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span>Kalorien:</span>
                  <span className="font-medium">{personalData.calories} kcal/Tag</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Protein:</span>
                  <span className="font-medium">{personalData.protein} g/Tag</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Kohlenhydrate:</span>
                  <span className="font-medium">500-600 g/Tag</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Fette:</span>
                  <span className="font-medium">120-150 g/Tag</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="font-medium">Basis-Supplements</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span>Kreatin:</span>
                  <span className="font-medium">5 g/Tag</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Vitamin D3:</span>
                  <span className="font-medium">1000-2000 IE/Tag</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Magnesium:</span>
                  <span className="font-medium">400-600 mg/Tag</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Zink:</span>
                  <span className="font-medium">30 mg/Tag</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Omega-3:</span>
                  <span className="font-medium">2-3 g EPA/DHA</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Citrullin:</span>
                  <span className="font-medium">6-8 g vor Training</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="font-medium">Optionale ergänzende Substanzen</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span>Epicatechin:</span>
                  <span className="font-medium">200-400 mg/Tag</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>MK-677:</span>
                  <span className="font-medium">25-50 mg/Nacht</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Enclomiphene:</span>
                  <span className="font-medium">12,5-25 mg/Tag</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>SLIN Pills:</span>
                  <span className="font-medium">je nach Produkt</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Hinweis:</strong> Diese optionalen Substanzen sind nur für informative Zwecke aufgelistet. Es wird empfohlen, mindestens bis zum Alter von 20 Jahren natürlich zu trainieren und immer ärztliche Beratung einzuholen.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card card-hover animate-slide-in" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle>Meilensteine & 4-Jahres-Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alter</TableHead>
                    <TableHead>Gewicht</TableHead>
                    <TableHead>Armgröße</TableHead>
                    <TableHead>Schulterbreite</TableHead>
                    <TableHead>Körperfett</TableHead>
                    <TableHead>Fokus</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milestones.map((milestone, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{milestone.age} Jahre</TableCell>
                      <TableCell>{milestone.weight}</TableCell>
                      <TableCell>{milestone.armSize}</TableCell>
                      <TableCell>{milestone.shoulderSize}</TableCell>
                      <TableCell>{milestone.bodyFat}</TableCell>
                      <TableCell>{milestone.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-6 p-4 border rounded-lg glass-card border-primary/20">
              <h3 className="font-medium mb-2">Empfehlungen</h3>
              <p className="text-sm text-muted-foreground">
                Du bist erst {personalData.age} Jahre alt - bleib lieber natural und baue dir eine solide Basis auf. Fokussiere dich auf regelmäßiges Training (6 Tage/Woche), konstante Ernährung im Kalorienüberschuss und bewährte Supplements wie Kreatin, Vitamin D, Magnesium, Zink und Omega-3.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
