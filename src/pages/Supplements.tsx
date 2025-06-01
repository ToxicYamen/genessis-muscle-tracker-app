
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { storageService } from "@/services/storageService";
import { CheckCircle2, Circle, Plus, Edit2, Trash2, Calendar, Clock, Zap, Sun, Droplet, Shield, Activity, Dumbbell } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const iconMap = {
  Zap, Sun, Droplet, Shield, Activity, Dumbbell
};

const Supplements = () => {
  const [supplements, setSupplements] = useState(storageService.getSupplements());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const toggleSupplement = (supplementId: string) => {
    storageService.toggleSupplementTaken(supplementId, selectedDate);
    setSupplements(storageService.getSupplements());
  };

  const getTakenCount = () => {
    return supplements.filter(s => s.taken[selectedDate]).length;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      basic: "bg-blue-500",
      performance: "bg-red-500", 
      health: "bg-green-500",
      recovery: "bg-purple-500"
    };
    return colors[category as keyof typeof colors] || "bg-gray-500";
  };

  const progressPercentage = (getTakenCount() / supplements.length) * 100;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <h2 className="text-3xl font-bold">Supplements</h2>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <Badge variant="outline" className="text-lg px-3 py-1">
            {getTakenCount()} / {supplements.length}
          </Badge>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Tagesfortschritt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Eingenommen</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {getTakenCount() === supplements.length 
                  ? "🎉 Alle Supplements für heute eingenommen!" 
                  : `Noch ${supplements.length - getTakenCount()} Supplements ausstehend`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {supplements.map((supplement, index) => {
          const IconComponent = iconMap[supplement.icon as keyof typeof iconMap] || Zap;
          const isTaken = supplement.taken[selectedDate];
          
          return (
            <motion.div
              key={supplement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 ${
                  isTaken ? 'ring-1 ring-green-800/30 bg-green-900/10 dark:bg-green-900/70' : 'hover:shadow-lg'
                }`}
                onClick={() => toggleSupplement(supplement.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`p-2 rounded-lg text-white ${getCategoryColor(supplement.category)}`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className={isTaken ? 'text-foreground' : ''}>
                        <CardTitle className="text-lg">{supplement.name}</CardTitle>
                        <Badge variant={isTaken ? 'default' : 'secondary'} className="text-xs mt-1">
                          {supplement.category}
                        </Badge>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isTaken ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 text-sm ${isTaken ? 'text-foreground' : 'text-muted-foreground'}`}>
                      <Zap className="w-4 h-4" />
                      <span>{supplement.dosage}</span>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${isTaken ? 'text-foreground' : 'text-muted-foreground'}`}>
                      <Clock className="w-4 h-4" />
                      <span>{supplement.timing}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid gap-6 md:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle>Kategorien Übersicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['basic', 'performance', 'health', 'recovery'].map(category => {
                const categorySupps = supplements.filter(s => s.category === category);
                const taken = categorySupps.filter(s => s.taken[selectedDate]).length;
                const percentage = categorySupps.length > 0 ? (taken / categorySupps.length) * 100 : 0;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{category}</span>
                      <span>{taken}/{categorySupps.length}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wochenstatistik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = format(date, "yyyy-MM-dd");
                const dayTaken = supplements.filter(s => s.taken[dateStr]).length;
                const percentage = supplements.length > 0 ? (dayTaken / supplements.length) * 100 : 0;
                
                return (
                  <div key={dateStr} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{format(date, "EEEE", { locale: de })}</span>
                      <span>{dayTaken}/{supplements.length}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Supplements;
