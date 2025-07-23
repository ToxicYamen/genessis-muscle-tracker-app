import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { ChevronLeft, ChevronRight, Target, TrendingUp, Calendar, Utensils, Pill, CheckCircle, Circle, Image } from "lucide-react";
import { useStore } from "@/store/useStore";
import { storageService, BodyMeasurement, ProgressImage, HabitData, NutritionData, SupplementData, StrengthData, AdvancedSupplementsSettings } from "@/services/storageService";
import { supabaseStorageService } from "@/services/supabaseStorageService";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const Dashboard = () => {
  const { height, weight, bodyFat } = useStore();
  const { user } = useSupabaseAuth();
  const [supplements, setSupplements] = useState<SupplementData[]>([]);
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [progressImages, setProgressImages] = useState<ProgressImage[]>([]);
  const [strengthData, setStrengthData] = useState<StrengthData[]>([]);
  const [position, setPosition] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSupplementsSettings>({ enabled: false });
  
  // Refs for the carousel
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Get most recent image for mobile
  const getMostRecentImage = () => {
    return progressImages.length > 0 ? [progressImages[progressImages.length - 1]] : [];
  };
  
  // Duplicate images for seamless looping on desktop
  const getImagesForLoop = () => {
    return [...progressImages, ...progressImages];
  };
  
  // Check if mobile view
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Auto-scrolling horizontal carousel
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;
    
    const updateSizes = () => {
      if (containerRef.current && contentRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        setContentWidth(contentRef.current.scrollWidth);
      }
    };
    
    updateSizes();
    window.addEventListener('resize', updateSizes);
    return () => window.removeEventListener('resize', updateSizes);
  }, [progressImages]);

  // Auto-scroll animation
  useEffect(() => {
    if (progressImages.length <= 3 || contentWidth <= containerWidth) return;
    
    const pixelsPerSecond = 10; // Very slow speed (10 pixels per second)
    let animationFrame: number;
    let lastTimestamp: number | null = null;
    
    const step = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      } else {
        const deltaTime = timestamp - lastTimestamp;
        const deltaPixels = (pixelsPerSecond * deltaTime) / 1000; // Convert to pixels based on time passed
        
        setPosition(prev => {
          const newPosition = prev + deltaPixels;
          // When we've scrolled the full width, reset to start
          return newPosition >= contentWidth ? 0 : newPosition;
        });
        
        lastTimestamp = timestamp;
      }
      
      animationFrame = requestAnimationFrame(step);
    };
    
    animationFrame = requestAnimationFrame(step);
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [progressImages, contentWidth, containerWidth]);
  

  const [nutrition, setNutrition] = useState<NutritionData>({
    calories: 0,
    protein: 0,
    water: 0,
    targetCalories: 4864,
    targetProtein: 280,
    targetWater: 4000
  });

  // Refresh data when component mounts or when data changes
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);


  const loadData = async () => {
    try {
      // Load data from Supabase
      const [
        bodyMeasurementsData,
        habitsData,
        habitCompletionsData,
        supplementsData,
        supplementCompletionsData,
        progressImagesData,
        strengthData,
        nutritionData
      ] = await Promise.all([
        supabaseStorageService.getBodyMeasurements(),
        supabaseStorageService.getHabits(),
        supabaseStorageService.getHabitCompletions(),
        supabaseStorageService.getSupplements(),
        supabaseStorageService.getSupplementCompletions(),
        supabaseStorageService.getProgressImages(),
        supabaseStorageService.getStrengthRecords(),
        supabaseStorageService.getNutritionRecords()
      ]);

      // Convert body measurements to local format
      const convertedMeasurements = bodyMeasurementsData.map(item => ({
        id: item.id,
        date: item.date,
        weight: item.weight || 0,
        height: item.height || 186,
        bodyFat: item.body_fat || 0,
        muscleMass: item.muscle_mass || 0
      }));

      // Convert habits to local format with completion data
      const today = format(new Date(), 'yyyy-MM-dd');
      const convertedHabits = habitsData.map(habit => {
        const completions = habitCompletionsData.filter(c => c.habit_id === habit.id);
        const dates: Record<string, number> = {};
        completions.forEach(completion => {
          dates[completion.date] = completion.count || 1;
        });
        
        return {
          id: habit.id,
          name: habit.name,
          icon: habit.icon,
          description: habit.description || '',
          target: habit.target,
          completed: completions.find(c => c.date === today)?.count || 0,
          streak: 0, // Calculate streak if needed
          dates,
          completedDates: completions.map(c => c.date)
        };
      });

      // Convert supplements to local format with completion data
      const convertedSupplements = supplementsData.map(supplement => {
        const completions = supplementCompletionsData.filter(c => c.supplement_id === supplement.id);
        const taken: { [key: string]: boolean } = {};
        completions.forEach(completion => {
          taken[completion.date] = completion.taken || false;
        });
        
        return {
          id: supplement.id,
          name: supplement.name,
          dosage: supplement.dosage,
          timing: supplement.timing,
          category: supplement.category as 'basic' | 'performance' | 'health' | 'recovery' | 'advanced',
          icon: supplement.icon,
          color: supplement.color,
          taken
        };
      });

      // Convert progress images to local format
      const convertedImages = progressImagesData.map(image => ({
        id: image.id,
        date: image.date,
        time: image.time,
        image: image.image_url,
        isFavorite: image.is_favorite || false,
        notes: image.notes || '',
        tags: image.tags || []
      }));

      // Convert strength data to local format  
      const convertedStrength = strengthData.map(record => ({
        id: record.id,
        date: record.date,
        exercise: record.exercise,
        sets: record.sets,
        reps: record.reps,
        weight: record.weight,
        notes: record.notes || ''
      }));

      // Get today's nutrition data
      const todayNutrition = nutritionData.find(n => n.date === today);
      const convertedNutrition = {
        calories: todayNutrition?.calories || 0,
        protein: todayNutrition?.protein || 0,
        water: todayNutrition?.water || 0,
        targetCalories: todayNutrition?.target_calories || 4864,
        targetProtein: todayNutrition?.target_protein || 280,
        targetWater: todayNutrition?.target_water || 4000
      };

      // Update state
      setBodyMeasurements(convertedMeasurements);
      setHabits(convertedHabits);
      setSupplements(convertedSupplements);
      setProgressImages(convertedImages);
      setStrengthData(convertedStrength);
      setNutrition(convertedNutrition);
      
      // Keep local storage for advanced settings (not in database yet)
      const advancedSupplementsSettings = storageService.getAdvancedSupplementsSettings();
      setAdvancedSettings(advancedSupplementsSettings);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to localStorage on error
      const supplementData = storageService.getSupplements();
      const habitData = storageService.getHabits();
      const measurementData = storageService.getBodyMeasurements();
      const imageData = storageService.getProgressImages();
      const strengthEntries = storageService.getStrengthData();
      const advancedSupplementsSettings = storageService.getAdvancedSupplementsSettings();
      const today = format(new Date(), 'yyyy-MM-dd');
      const nutritionData = storageService.getNutrition(today);
      
      setSupplements(supplementData);
      setHabits(habitData);
      setBodyMeasurements(measurementData);
      setProgressImages(imageData);
      setStrengthData(strengthEntries);
      setAdvancedSettings(advancedSupplementsSettings);
      setNutrition(nutritionData);
    }
  };

  // Time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const name = "Yamen";
    
    if (hour < 12) return `Guten Morgen, ${name}! 🌅`;
    if (hour < 17) return `Guten Tag, ${name}! ☀️`;
    if (hour < 22) return `Guten Abend, ${name}! 🌇`;
    return `Gute Nacht, ${name}! 🌙`;
  };

  // Transformation calculations
  const transformationStartDate = new Date('2025-01-01');
  const currentDate = new Date();
  const yearsSinceStart = Math.floor((currentDate.getTime() - transformationStartDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const currentTransformationYear = Math.max(1, Math.min(4, yearsSinceStart + 1));
  
  const getTransformationProgress = () => {
    const startWeight = 75;
    const targetWeight = 100;
    const currentWeight = weight || startWeight;
    const progress = ((currentWeight - startWeight) / (targetWeight - startWeight)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  // Supplements status - get all supplements including advanced if enabled
  const today = format(new Date(), "yyyy-MM-dd");
  const allSupplements = advancedSettings.enabled 
    ? supplements 
    : supplements.filter(s => s.category !== 'advanced');
  
  const takenSupplements = allSupplements.filter(s => s.taken[today]).length;

  // Habits status
  const completedHabits = habits.filter(habit => 
    habit.completedDates.includes(today)
  ).length;

  // Create weight chart data from real measurements
  const getWeightChartData = () => {
    if (bodyMeasurements.length === 0) {
      // Fallback data if no measurements
      return [
        { date: "1. Jan", weight: 75, bodyFat: 12 },
        { date: "15. Jan", weight: 77, bodyFat: 11.8 },
        { date: "1. Feb", weight: 79, bodyFat: 11.5 },
        { date: "15. Feb", weight: weight || 81, bodyFat: bodyFat || 11.2 },
      ];
    }

    // Use real data from measurements
    const recentMeasurements = bodyMeasurements.slice(-6); // Last 6 measurements
    return recentMeasurements.map(measurement => ({
      date: format(new Date(measurement.date), "d. MMM", { locale: de }),
      weight: measurement.weight,
      bodyFat: measurement.bodyFat
    }));
  };

  // Interface for exercise data with date
  interface ExerciseWithDate {
    exercise: string;
    weight: number;
    date?: string;
  }

  // Get strength data from state (loaded from Supabase)
  const getStrengthData = (): ExerciseWithDate[] => {
    try {
      if (!strengthData || strengthData.length === 0) {
        return [];
      }
      
      // Group entries by exercise and get the latest weight for each
      const exerciseMap = new Map<string, {weight: number, date: string}>();
      
      // Process each entry and keep only the latest one per exercise
      strengthData.forEach(entry => {
        if (!entry || !entry.exercise) return;
        
        const exerciseName = entry.exercise.trim();
        const existing = exerciseMap.get(exerciseName);
        const entryDate = new Date(entry.date || 0);
        
        if (!existing || (entry.date && new Date(existing.date) < entryDate)) {
          exerciseMap.set(exerciseName, {
            weight: entry.weight || 0,
            date: entry.date || new Date().toISOString()
          });
        }
      });
      
      // Convert map to array and sort by exercise name for consistent order
      return Array.from(exerciseMap.entries())
        .map(([exercise, data]) => ({
          exercise,
          weight: data.weight,
          date: data.date
        }))
        .sort((a, b) => a.exercise.localeCompare(b.exercise));
    } catch (error) {
      console.error('Error processing strength data:', error);
      return [];
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          {getTimeBasedGreeting()}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Willkommen zu deiner GENESIS 4 Transformation - Jahr {currentTransformationYear}/4
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="glass-card p-3 sm:p-4">
          <div className="flex flex-col">
            <div className="text-xs sm:text-sm text-muted-foreground">Gewicht</div>
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {bodyMeasurements.length > 0 ? bodyMeasurements[bodyMeasurements.length - 1].weight : weight || 75} kg
            </div>
            <div className="text-xs text-green-400">
              +{bodyMeasurements.length > 0 ? 
                (bodyMeasurements[bodyMeasurements.length - 1].weight - 75).toFixed(1) : 
                (weight ? (weight - 75).toFixed(1) : '0')} kg
            </div>
          </div>
        </Card>

        <Card className="glass-card p-3 sm:p-4">
          <div className="flex flex-col">
            <div className="text-xs sm:text-sm text-muted-foreground">Körperfett</div>
            <div className="text-lg sm:text-2xl font-bold text-orange-400">
              {bodyMeasurements.length > 0 ? bodyMeasurements[bodyMeasurements.length - 1].bodyFat : bodyFat || 12}%
            </div>
            <div className="text-xs text-muted-foreground">Ziel: 8%</div>
          </div>
        </Card>

        <Card className="glass-card p-3 sm:p-4">
          <div className="flex flex-col">
            <div className="text-xs sm:text-sm text-muted-foreground">Fortschritt zu 90kg</div>
            <div className="text-lg sm:text-2xl font-bold text-green-400">
              {(() => {
                const currentWeight = bodyMeasurements.length > 0 ? 
                  bodyMeasurements[bodyMeasurements.length - 1].weight : 
                  weight || 75;
                const progress = ((currentWeight - 75) / (90 - 75)) * 100;
                return Math.min(100, Math.max(0, progress)).toFixed(0);
              })()}%
            </div>
            <div className="text-xs text-muted-foreground">von 75kg → 90kg</div>
          </div>
        </Card>

        <Card className="glass-card p-3 sm:p-4">
          <div className="flex flex-col">
            <div className="text-xs sm:text-sm text-muted-foreground">Jahr</div>
            <div className="text-lg sm:text-2xl font-bold text-purple-400">{currentTransformationYear}/4</div>
            <div className="text-xs text-muted-foreground">2025-2028</div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Körpergewicht Trend */}
        <Card className="glass-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Körpergewicht & Körperfett
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getWeightChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} name="Gewicht (kg)" />
                  <Line type="monotone" dataKey="bodyFat" stroke="#f97316" strokeWidth={2} name="Körperfett (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Progress Gallery Preview */}
        <Card className="glass-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Image className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
              Progress Gallery
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progressImages.length > 0 ? (
              <div className="relative overflow-hidden h-48 sm:h-56" ref={containerRef}>
                {isMobile ? (
                  // Mobile view - show only most recent image
                  <div className="h-full flex items-center justify-center">
                    {getMostRecentImage().map((image) => (
                      <div
                        key={image.id}
                        className="h-full aspect-square rounded-lg overflow-hidden bg-card/50 border"
                      >
                        <img
                          src={image.image}
                          alt={`Progress ${image.date}`}
                          className="w-full h-full object-cover"
                          draggable="false"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  // Desktop view - show scrolling carousel
                  <motion.div 
                    className="absolute top-0 left-0 h-full flex items-center gap-2"
                    ref={contentRef}
                    style={{
                      x: -position,
                      willChange: 'transform',
                    }}
                  >
                    {getImagesForLoop().map((image, index) => (
                      <motion.div
                        key={`${image.id}-${index}`}
                        className="h-full aspect-square rounded-lg overflow-hidden bg-card/50 border flex-shrink-0"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <img
                          src={image.image}
                          alt={`Progress ${image.date}`}
                          className="w-full h-full object-cover"
                          draggable="false"
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 bg-card/50 rounded-lg border border-dashed">
                <div className="text-center text-muted-foreground">
                  <Image className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Noch keine Fortschrittsbilder</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Nutrition, Supplements & Habits */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Heutige Ernährung */}
        <Card className="glass-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              Heutige Ernährung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Calories Progress Line */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Kalorien</span>
                <span>{nutrition.calories} / {nutrition.targetCalories} kcal</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((nutrition.calories / nutrition.targetCalories) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {((nutrition.calories / nutrition.targetCalories) * 100).toFixed(0)}% des Tagesziels erreicht
              </div>
            </div>

            {/* Protein Progress Line */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Protein</span>
                <span>{nutrition.protein} / {nutrition.targetProtein} g</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((nutrition.protein / nutrition.targetProtein) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {((nutrition.protein / nutrition.targetProtein) * 100).toFixed(0)}% des Tagesziels erreicht
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplements Status */}
        <Card className="glass-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Pill className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
              Supplements heute
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {takenSupplements}/{allSupplements.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">eingenommen</div>
              </div>
              <div className={`p-2 sm:p-3 rounded-full ${
                takenSupplements === allSupplements.length ? 'bg-green-500/20' : 'bg-orange-500/20'
              }`}>
                {takenSupplements === allSupplements.length ? (
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fortschritt</span>
                <span>{allSupplements.length > 0 ? ((takenSupplements / allSupplements.length) * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${allSupplements.length > 0 ? (takenSupplements / allSupplements.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            {takenSupplements < allSupplements.length && (
              <div className="mt-3 p-2 sm:p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <p className="text-xs sm:text-sm text-orange-400">
                  {allSupplements.length - takenSupplements} Supplement(e) noch nicht eingenommen
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Habits Status */}
        <Card className="glass-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              Habits heute
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {completedHabits}/{habits.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">erledigt</div>
              </div>
              <div className={`p-2 sm:p-3 rounded-full ${
                completedHabits === habits.length ? 'bg-green-500/20' : 'bg-orange-500/20'
              }`}>
                {completedHabits === habits.length ? (
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fortschritt</span>
                <span>{habits.length > 0 ? ((completedHabits / habits.length) * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${habits.length > 0 ? (completedHabits / habits.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            {completedHabits < habits.length && (
              <div className="mt-3 p-2 sm:p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <p className="text-xs sm:text-sm text-orange-400">
                  {habits.length - completedHabits} Habit(s) noch nicht erledigt
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Kraftentwicklung section has been removed */}

      {/* Transformation Overview */}
      <Card className="glass-card">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
            GENESIS 4 Transformation Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
            <div className="text-center p-3 sm:p-4 border rounded-lg bg-card/50">
              <div className="text-xs sm:text-sm text-muted-foreground mb-2">Aktuelles Jahr</div>
              <div className="text-xl sm:text-2xl font-bold text-primary">Jahr {currentTransformationYear}</div>
              <div className="text-xs text-muted-foreground mt-1">von 4 Jahren</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 border rounded-lg bg-card/50">
              <div className="text-xs sm:text-sm text-muted-foreground mb-2">Gewichtszunahme</div>
              <div className="text-xl sm:text-2xl font-bold text-green-400">
                +{weight ? (weight - 75).toFixed(1) : '0'} kg
              </div>
              <div className="text-xs text-muted-foreground mt-1">von 25 kg Ziel</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 border rounded-lg bg-card/50">
              <div className="text-xs sm:text-sm text-muted-foreground mb-2">Gesamtfortschritt</div>
              <div className="text-xl sm:text-2xl font-bold text-orange-400">
                {getTransformationProgress().toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">abgeschlossen</div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Transformation Fortschritt</span>
              <span>{getTransformationProgress().toFixed(1)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${getTransformationProgress()}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
