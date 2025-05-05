
import { useState } from "react";
import { useTrackingData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersonalData } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Profile = () => {
  const { personalData, updatePersonalData, milestones } = useTrackingData();
  const [formData, setFormData] = useState<PersonalData>({...personalData});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === "name" ? value : parseFloat(value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePersonalData(formData);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Persönliche Daten</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="age" className="text-sm font-medium">
                    Alter
                  </label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Alter"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="height" className="text-sm font-medium">
                    Größe (cm)
                  </label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="Größe in cm"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="weight" className="text-sm font-medium">
                    Gewicht (kg)
                  </label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="Gewicht in kg"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="bodyFat" className="text-sm font-medium">
                    Körperfett (%)
                  </label>
                  <Input
                    id="bodyFat"
                    name="bodyFat"
                    type="number"
                    step="0.1"
                    value={formData.bodyFat}
                    onChange={handleInputChange}
                    placeholder="Körperfett in %"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="calories" className="text-sm font-medium">
                    Kalorien / Tag
                  </label>
                  <Input
                    id="calories"
                    name="calories"
                    type="number"
                    value={formData.calories}
                    onChange={handleInputChange}
                    placeholder="Täglicher Kalorienbedarf"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="protein" className="text-sm font-medium">
                    Protein (g/Tag)
                  </label>
                  <Input
                    id="protein"
                    name="protein"
                    type="number"
                    value={formData.protein}
                    onChange={handleInputChange}
                    placeholder="Täglicher Proteinbedarf"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="sleep" className="text-sm font-medium">
                    Schlaf (Stunden)
                  </label>
                  <Input
                    id="sleep"
                    name="sleep"
                    type="number"
                    step="0.5"
                    value={formData.sleep}
                    onChange={handleInputChange}
                    placeholder="Schlafstunden"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Daten speichern
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
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
      </div>
      
      <Card>
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
                    <TableCell>{milestone.weight} kg</TableCell>
                    <TableCell>{milestone.armSize} cm</TableCell>
                    <TableCell>{milestone.shoulderSize} cm</TableCell>
                    <TableCell>{milestone.bodyFat}</TableCell>
                    <TableCell>{milestone.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 p-4 border rounded-lg bg-secondary">
            <h3 className="font-medium mb-2">Empfehlungen</h3>
            <p className="text-sm text-muted-foreground">
              Du bist erst 18 Jahre alt - bleib lieber natural und baue dir eine solide Basis auf. Fokussiere dich auf regelmäßiges Training (6 Tage/Woche), konstante Ernährung im Kalorienüberschuss und bewährte Supplements wie Kreatin, Vitamin D, Magnesium, Zink und Omega-3.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
