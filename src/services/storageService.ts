
export interface HabitData {
  id: string;
  name: string;
  icon: string;
  target: number;
  completed: number;
  streak: number;
  dates: Record<string, number>; // date -> count
}

export interface NutritionData {
  calories: number;
  protein: number;
  water: number;
  targetCalories: number;
  targetProtein: number;
  targetWater: number;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  height: number;
  chest?: number;
  waist?: number;
  arms?: number;
  thighs?: number;
  shoulders?: number;
  notes?: string;
}

export interface ProgressImage {
  id: string;
  date: string;
  time: string;
  image: string; // base64
  notes?: string;
  isFavorite?: boolean;
  tags?: string[];
}

export interface SupplementData {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  taken: Record<string, boolean>; // date -> taken
  category: 'basic' | 'performance' | 'health' | 'recovery';
  icon: string;
  color: string;
}

export interface WorkoutData {
  id: string;
  splitName: string;
  days: WorkoutDay[];
  supplements: string[];
  nutrition: NutritionPlan;
}

export interface WorkoutDay {
  name: string;
  focus: string;
  exercises: string[];
  isRestDay: boolean;
}

export interface NutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: string[];
}

export interface StrengthData {
  id: string;
  date: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
}

class StorageService {
  // Habits
  getHabits(): HabitData[] {
    const stored = localStorage.getItem('genesis4_habits');
    return stored ? JSON.parse(stored) : [];
  }

  saveHabits(habits: HabitData[]): void {
    localStorage.setItem('genesis4_habits', JSON.stringify(habits));
  }

  updateHabitCount(habitId: string, date: string, count: number): void {
    const habits = this.getHabits();
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      habit.dates[date] = count;
      habit.completed = count;
      this.saveHabits(habits);
    }
  }

  // Nutrition
  getNutrition(date: string): NutritionData {
    const stored = localStorage.getItem(`genesis4_nutrition_${date}`);
    return stored ? JSON.parse(stored) : {
      calories: 0,
      protein: 0,
      water: 0,
      targetCalories: 4864,
      targetProtein: 280,
      targetWater: 4000
    };
  }

  saveNutrition(date: string, nutrition: NutritionData): void {
    localStorage.setItem(`genesis4_nutrition_${date}`, JSON.stringify(nutrition));
  }

  // Body Measurements
  getBodyMeasurements(): BodyMeasurement[] {
    const stored = localStorage.getItem('genesis4_measurements');
    return stored ? JSON.parse(stored) : [];
  }

  saveBodyMeasurement(measurement: BodyMeasurement): void {
    const measurements = this.getBodyMeasurements();
    const existingIndex = measurements.findIndex(m => m.id === measurement.id);
    
    if (existingIndex >= 0) {
      measurements[existingIndex] = measurement;
    } else {
      measurements.push(measurement);
    }
    
    measurements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    localStorage.setItem('genesis4_measurements', JSON.stringify(measurements));
  }

  deleteBodyMeasurement(id: string): void {
    const measurements = this.getBodyMeasurements();
    const filtered = measurements.filter(m => m.id !== id);
    localStorage.setItem('genesis4_measurements', JSON.stringify(filtered));
  }

  // Progress Images
  getProgressImages(): ProgressImage[] {
    const stored = localStorage.getItem('genesis4_images');
    return stored ? JSON.parse(stored) : [];
  }

  saveProgressImage(image: ProgressImage): void {
    const images = this.getProgressImages();
    images.push(image);
    images.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());
    localStorage.setItem('genesis4_images', JSON.stringify(images));
  }

  deleteProgressImage(id: string): void {
    const images = this.getProgressImages();
    const filtered = images.filter(img => img.id !== id);
    localStorage.setItem('genesis4_images', JSON.stringify(filtered));
  }

  toggleImageFavorite(id: string): void {
    const images = this.getProgressImages();
    const image = images.find(img => img.id === id);
    if (image) {
      image.isFavorite = !image.isFavorite;
      localStorage.setItem('genesis4_images', JSON.stringify(images));
    }
  }

  // Supplements
  getSupplements(): SupplementData[] {
    const stored = localStorage.getItem('genesis4_supplements');
    return stored ? JSON.parse(stored) : this.getDefaultSupplements();
  }

  saveSupplements(supplements: SupplementData[]): void {
    localStorage.setItem('genesis4_supplements', JSON.stringify(supplements));
  }

  toggleSupplementTaken(supplementId: string, date: string): void {
    const supplements = this.getSupplements();
    const supplement = supplements.find(s => s.id === supplementId);
    if (supplement) {
      supplement.taken[date] = !supplement.taken[date];
      this.saveSupplements(supplements);
    }
  }

  private getDefaultSupplements(): SupplementData[] {
    return [
      {
        id: 'creatine',
        name: 'Kreatin',
        dosage: '5g',
        timing: 'Täglich',
        taken: {},
        category: 'basic',
        icon: 'Zap',
        color: '#3b82f6'
      },
      {
        id: 'vitamin_d',
        name: 'Vitamin D3',
        dosage: '2000 IE',
        timing: 'Morgens',
        taken: {},
        category: 'health',
        icon: 'Sun',
        color: '#f59e0b'
      },
      {
        id: 'omega3',
        name: 'Omega-3',
        dosage: '2-3g EPA/DHA',
        timing: 'Zu den Mahlzeiten',
        taken: {},
        category: 'health',
        icon: 'Droplet',
        color: '#06b6d4'
      },
      {
        id: 'magnesium',
        name: 'Magnesium',
        dosage: '400-600mg',
        timing: 'Abends',
        taken: {},
        category: 'basic',
        icon: 'Shield',
        color: '#22c55e'
      },
      {
        id: 'zinc',
        name: 'Zink',
        dosage: '30mg',
        timing: 'Abends',
        taken: {},
        category: 'basic',
        icon: 'Activity',
        color: '#8b5cf6'
      },
      {
        id: 'citrullin',
        name: 'Citrullin',
        dosage: '6-8g',
        timing: 'Pre-Workout',
        taken: {},
        category: 'performance',
        icon: 'Dumbbell',
        color: '#ef4444'
      }
    ];
  }

  // Workout Data
  getWorkoutData(): WorkoutData {
    const stored = localStorage.getItem('genesis4_workout');
    return stored ? JSON.parse(stored) : this.getDefaultWorkout();
  }

  saveWorkoutData(workout: WorkoutData): void {
    localStorage.setItem('genesis4_workout', JSON.stringify(workout));
  }

  private getDefaultWorkout(): WorkoutData {
    return {
      id: 'arnold_split',
      splitName: 'Arnold Split',
      days: [
        {
          name: 'Montag',
          focus: 'Brust & Rücken',
          exercises: [
            'Bankdrücken 4x8-10',
            'Kurzhantel Fliegende 3x10-12',
            'Klimmzüge 4x8-10',
            'Langhantel Rudern 4x8-10',
            'Dips 3x10-12',
            'Kabelzug Rudern 3x10-12'
          ],
          isRestDay: false
        },
        {
          name: 'Dienstag',
          focus: 'Schultern & Arme',
          exercises: [
            'Schulterdrücken 4x8-10',
            'Seitheben 4x12-15',
            'Bizeps Curls 4x10-12',
            'Trizeps Dips 4x10-12',
            'Reverse Flys 3x12-15',
            'Hammer Curls 3x10-12'
          ],
          isRestDay: false
        },
        {
          name: 'Mittwoch',
          focus: 'Beine & Bauch',
          exercises: [
            'Kniebeugen 4x8-10',
            'Rumänisches Kreuzheben 4x8-10',
            'Beinstrecker 3x12-15',
            'Beinbeuger 3x12-15',
            'Wadenheben 4x15-20',
            'Planks 3x60s'
          ],
          isRestDay: false
        },
        {
          name: 'Donnerstag',
          focus: 'Brust & Rücken',
          exercises: [
            'Schrägbankdrücken 4x8-10',
            'Kurzhantel Rudern 4x8-10',
            'Butterfly 3x10-12',
            'Latzug 4x8-10',
            'Pushups 3x max',
            'Facepulls 3x12-15'
          ],
          isRestDay: false
        },
        {
          name: 'Freitag',
          focus: 'Schultern & Arme',
          exercises: [
            'Arnold Press 4x8-10',
            'Frontheben 3x12-15',
            'Preacher Curls 4x10-12',
            'French Press 4x10-12',
            'Shrugs 3x12-15',
            'Concentration Curls 3x10-12'
          ],
          isRestDay: false
        },
        {
          name: 'Samstag',
          focus: 'Beine & Bauch',
          exercises: [
            'Beinpresse 4x12-15',
            'Ausfallschritte 3x12 je Bein',
            'Beinstrecker 4x12-15',
            'Beinbeuger 4x12-15',
            'Crunches 4x20',
            'Beinheben 3x15'
          ],
          isRestDay: false
        }
      ],
      supplements: ['creatine', 'citrullin'],
      nutrition: {
        calories: 4864,
        protein: 280,
        carbs: 600,
        fats: 150,
        meals: [
          'Frühstück: Haferflocken mit Protein',
          'Snack 1: Protein Shake',
          'Mittagessen: Reis mit Hähnchen',
          'Pre-Workout: Banane + Citrullin',
          'Post-Workout: Protein Shake',
          'Abendessen: Lachs mit Süßkartoffeln',
          'Snack 2: Quark mit Nüssen'
        ]
      }
    };
  }

  // Strength Data
  getStrengthData(): StrengthData[] {
    const stored = localStorage.getItem('genesis4_strength');
    return stored ? JSON.parse(stored) : [];
  }

  saveStrengthEntry(entry: StrengthData): void {
    const data = this.getStrengthData();
    const existingIndex = data.findIndex(d => d.id === entry.id);
    
    if (existingIndex >= 0) {
      data[existingIndex] = entry;
    } else {
      data.push(entry);
    }
    
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem('genesis4_strength', JSON.stringify(data));
  }

  deleteStrengthEntry(id: string): void {
    const data = this.getStrengthData();
    const filtered = data.filter(d => d.id !== id);
    localStorage.setItem('genesis4_strength', JSON.stringify(filtered));
  }

  // Data Export/Import
  exportAllData(): string {
    const data = {
      habits: this.getHabits(),
      measurements: this.getBodyMeasurements(),
      images: this.getProgressImages(),
      supplements: this.getSupplements(),
      workout: this.getWorkoutData(),
      strength: this.getStrengthData(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importAllData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.habits) this.saveHabits(data.habits);
      if (data.measurements) localStorage.setItem('genesis4_measurements', JSON.stringify(data.measurements));
      if (data.images) localStorage.setItem('genesis4_images', JSON.stringify(data.images));
      if (data.supplements) this.saveSupplements(data.supplements);
      if (data.workout) this.saveWorkoutData(data.workout);
      if (data.strength) localStorage.setItem('genesis4_strength', JSON.stringify(data.strength));
      
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('genesis4_'));
    keys.forEach(key => localStorage.removeItem(key));
  }
}

export const storageService = new StorageService();
