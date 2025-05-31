
export interface HabitData {
  id: string;
  name: string;
  icon: string;
  target: number;
  completed: number;
  streak: number;
  dates: Record<string, number>;
}

export interface NutritionData {
  date: string;
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
  height: number;
  bodyFat: number;
  muscleMass: number;
}

export interface ProgressImage {
  id: string;
  date: string;
  time: string;
  image: string;
  notes?: string;
}

class StorageService {
  // Habits
  getHabits(): HabitData[] {
    const data = localStorage.getItem('habits');
    return data ? JSON.parse(data) : this.getDefaultHabits();
  }

  saveHabits(habits: HabitData[]): void {
    localStorage.setItem('habits', JSON.stringify(habits));
  }

  updateHabitProgress(habitId: string, date: string, value: number): void {
    const habits = this.getHabits();
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      habit.dates[date] = value;
      habit.completed = value;
      this.saveHabits(habits);
    }
  }

  // Nutrition
  getNutrition(date: string): NutritionData {
    const key = `nutrition_${date}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : this.getDefaultNutrition(date);
  }

  saveNutrition(date: string, nutrition: NutritionData): void {
    const key = `nutrition_${date}`;
    localStorage.setItem(key, JSON.stringify(nutrition));
  }

  addNutritionValue(date: string, type: 'calories' | 'protein' | 'water', amount: number): void {
    const nutrition = this.getNutrition(date);
    nutrition[type] += amount;
    this.saveNutrition(date, nutrition);
  }

  // Body Measurements
  getBodyMeasurements(): BodyMeasurement[] {
    const data = localStorage.getItem('bodyMeasurements');
    return data ? JSON.parse(data) : [];
  }

  saveBodyMeasurement(measurement: BodyMeasurement): void {
    const measurements = this.getBodyMeasurements();
    const existingIndex = measurements.findIndex(m => m.date === measurement.date);
    
    if (existingIndex >= 0) {
      measurements[existingIndex] = measurement;
    } else {
      measurements.push(measurement);
    }
    
    measurements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    localStorage.setItem('bodyMeasurements', JSON.stringify(measurements));
  }

  // Progress Images
  getProgressImages(): ProgressImage[] {
    const data = localStorage.getItem('progressImages');
    return data ? JSON.parse(data) : [];
  }

  saveProgressImage(image: ProgressImage): void {
    const images = this.getProgressImages();
    images.push(image);
    images.sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());
    localStorage.setItem('progressImages', JSON.stringify(images));
  }

  deleteProgressImage(id: string): void {
    const images = this.getProgressImages().filter(img => img.id !== id);
    localStorage.setItem('progressImages', JSON.stringify(images));
  }

  // Helper methods
  private getDefaultHabits(): HabitData[] {
    return [
      {
        id: '1',
        name: 'Protein Shake',
        icon: 'Utensils',
        target: 2,
        completed: 0,
        streak: 0,
        dates: {}
      },
      {
        id: '2',
        name: 'Wasser (2L)',
        icon: 'Droplet',
        target: 4,
        completed: 0,
        streak: 0,
        dates: {}
      },
      {
        id: '3',
        name: 'Kreatin',
        icon: 'Pill',
        target: 1,
        completed: 0,
        streak: 0,
        dates: {}
      },
      {
        id: '4',
        name: 'Multivitamin',
        icon: 'CircleCheck',
        target: 1,
        completed: 0,
        streak: 0,
        dates: {}
      }
    ];
  }

  private getDefaultNutrition(date: string): NutritionData {
    return {
      date,
      calories: 0,
      protein: 0,
      water: 0,
      targetCalories: 4864,
      targetProtein: 280,
      targetWater: 5
    };
  }

  // Clear all data
  clearAllData(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('habits') || 
          key.startsWith('nutrition_') || 
          key.startsWith('bodyMeasurements') || 
          key.startsWith('progressImages')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Export/Import functionality
  exportData(): string {
    const data = {
      habits: this.getHabits(),
      bodyMeasurements: this.getBodyMeasurements(),
      progressImages: this.getProgressImages(),
      nutritionData: this.getAllNutritionData()
    };
    return JSON.stringify(data, null, 2);
  }

  private getAllNutritionData(): Record<string, NutritionData> {
    const data: Record<string, NutritionData> = {};
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('nutrition_')) {
        const date = key.replace('nutrition_', '');
        data[date] = this.getNutrition(date);
      }
    });
    return data;
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      if (data.habits) this.saveHabits(data.habits);
      if (data.bodyMeasurements) localStorage.setItem('bodyMeasurements', JSON.stringify(data.bodyMeasurements));
      if (data.progressImages) localStorage.setItem('progressImages', JSON.stringify(data.progressImages));
      if (data.nutritionData) {
        Object.entries(data.nutritionData).forEach(([date, nutrition]) => {
          this.saveNutrition(date, nutrition as NutritionData);
        });
      }
    } catch (error) {
      throw new Error('Invalid data format');
    }
  }
}

export const storageService = new StorageService();
