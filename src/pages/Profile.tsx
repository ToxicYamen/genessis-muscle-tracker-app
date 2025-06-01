
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CameraIcon, UserIcon, Target, TrendingUp, Calendar, Award, Edit3, Save, X } from "lucide-react";
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
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const milestones = [
    { age: 18, weight: "75 kg", armSize: "35 cm", shoulderSize: "110 cm", bodyFat: "12%", note: "Ausgangspunkt - Natural Training", color: "bg-blue-500" },
    { age: 19, weight: "82 kg", armSize: "38 cm", shoulderSize: "115 cm", bodyFat: "10%", note: "Jahr 1 - Grundlagen aufbauen", color: "bg-green-500" },
    { age: 20, weight: "88 kg", armSize: "41 cm", shoulderSize: "120 cm", bodyFat: "9%", note: "Jahr 2 - Kraft & Masse", color: "bg-yellow-500" },
    { age: 21, weight: "95 kg", armSize: "44 cm", shoulderSize: "125 cm", bodyFat: "8.5%", note: "Jahr 3 - Definition & Größe", color: "bg-orange-500" },
    { age: 22, weight: "100 kg", armSize: "46 cm", shoulderSize: "130 cm", bodyFat: "8%", note: "Jahr 4 - Ziel erreicht!", color: "bg-red-500" }
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
    setIsEditing(false);
    
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

  // Calculate BMI and progress
  const bmi = (personalData.weight / ((personalData.height / 100) ** 2)).toFixed(1);
  const yearProgress = ((personalData.age - 18) / 4) * 100;
  const weightProgress = ((personalData.weight - 75) / (100 - 75)) * 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="space-y-8 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="text-center"
        variants={itemVariants}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Mein Profil
        </h1>
        <p className="text-muted-foreground">Verwalte deine Transformation und Ziele</p>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass-enhanced border-primary/20 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-primary/20 via-blue-400/20 to-purple-400/20">
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
          </div>
          <CardContent className="relative -mt-16 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Profile Picture */}
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={personalData.profileImage} alt={personalData.name || "Profilbild"} />
                  <AvatarFallback className="text-3xl bg-primary/10">
                    {personalData.name ? personalData.name.charAt(0).toUpperCase() : <UserIcon className="h-12 w-12" />}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full border-primary/30 bg-background/80 backdrop-blur group-hover:scale-110 transition-transform"
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

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold">{personalData.name || "Dein Name"}</h2>
                <p className="text-muted-foreground text-lg mb-4">{personalData.age} Jahre • Genesis 4 Transformation</p>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {personalData.height} cm
                  </Badge>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-400">
                    {personalData.weight} kg
                  </Badge>
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-400">
                    {personalData.bodyFat}% KF
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">
                    BMI: {bmi}
                  </Badge>
                </div>
              </div>

              {/* Edit Button */}
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "destructive" : "outline"}
                className="min-w-[120px]"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Abbrechen
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Form Modal */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-enhanced border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-primary" />
                Persönliche Daten bearbeiten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                      className="glass-card border-primary/20"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Änderungen speichern
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={itemVariants}
      >
        <Card className="glass-enhanced border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">4-Jahres-Fortschritt</p>
                <p className="text-2xl font-bold">{yearProgress.toFixed(0)}%</p>
                <Progress value={yearProgress} className="h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-enhanced border-green-500/20 hover:border-green-500/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gewichtszunahme</p>
                <p className="text-2xl font-bold">{personalData.weight} kg</p>
                <Progress value={weightProgress} className="h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-enhanced border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tägliche Kalorien</p>
                <p className="text-2xl font-bold">{personalData.calories}</p>
                <p className="text-sm text-muted-foreground">kcal/Tag</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-enhanced border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10">
                <Award className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tägliches Protein</p>
                <p className="text-2xl font-bold">{personalData.protein}g</p>
                <p className="text-sm text-muted-foreground">{(personalData.protein / personalData.weight).toFixed(1)}g/kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Timeline & Milestones */}
      <motion.div 
        className="grid gap-6 lg:grid-cols-2"
        variants={itemVariants}
      >
        <Card className="glass-enhanced border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              4-Jahres-Transformationsplan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border/50"
                >
                  <div className={`w-4 h-4 rounded-full ${milestone.color} ${personalData.age >= milestone.age ? 'animate-pulse' : ''}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{milestone.age} Jahre</span>
                      <Badge variant="outline" className="text-xs">{milestone.weight}</Badge>
                      <Badge variant="outline" className="text-xs">{milestone.bodyFat}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{milestone.note}</p>
                  </div>
                  {personalData.age >= milestone.age && (
                    <div className="text-green-400">
                      <Award className="h-5 w-5" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-enhanced border-primary/20">
          <CardHeader>
            <CardTitle>Ernährung & Supplements Übersicht</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  Makronährstoffe
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground">Kalorien</p>
                    <p className="font-bold text-primary">{personalData.calories} kcal</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <p className="text-sm text-muted-foreground">Protein</p>
                    <p className="font-bold text-green-400">{personalData.protein}g</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <p className="text-sm text-muted-foreground">Kohlenhydrate</p>
                    <p className="font-bold text-blue-400">500-600g</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                    <p className="text-sm text-muted-foreground">Fette</p>
                    <p className="font-bold text-orange-400">120-150g</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  Basis-Supplements
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    { name: "Kreatin", dose: "5g/Tag", color: "bg-green-500/10 text-green-400" },
                    { name: "Vitamin D3", dose: "1000-2000 IE", color: "bg-yellow-500/10 text-yellow-400" },
                    { name: "Magnesium", dose: "400-600mg", color: "bg-blue-500/10 text-blue-400" },
                    { name: "Omega-3", dose: "2-3g EPA/DHA", color: "bg-purple-500/10 text-purple-400" }
                  ].map((supplement, index) => (
                    <div key={index} className="flex justify-between items-center p-2 rounded border border-border/50">
                      <span>{supplement.name}</span>
                      <Badge className={supplement.color}>{supplement.dose}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendation Banner */}
      <motion.div variants={itemVariants}>
        <Card className="glass-enhanced border-primary/20 bg-gradient-to-r from-primary/5 to-blue-400/5">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 text-primary flex items-center justify-center gap-2">
                <Target className="h-6 w-6" />
                Empfehlung für dein Alter ({personalData.age} Jahre)
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Bleib natural und baue dir eine solide Basis auf! Fokussiere dich auf regelmäßiges Training, 
                konstante Ernährung im Kalorienüberschuss und bewährte Supplements. Deine Transformation 
                wird nachhaltig und gesund sein.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Profile;
