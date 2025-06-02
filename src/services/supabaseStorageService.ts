
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
type BodyMeasurement = Tables['body_measurements']['Row'];
type Measurement = Tables['measurements']['Row'];
type StrengthRecord = Tables['strength_records']['Row'];
type ProgressImage = Tables['progress_images']['Row'];
type Habit = Tables['habits']['Row'];
type HabitCompletion = Tables['habit_completions']['Row'];
type NutritionRecord = Tables['nutrition_records']['Row'];
type Supplement = Tables['supplements']['Row'];
type SupplementCompletion = Tables['supplement_completions']['Row'];
type WorkoutPlan = Tables['workout_plans']['Row'];

export interface SupabaseStorageService {
  // Profile methods
  getProfile(): Promise<Profile | null>;
  updateProfile(profile: Partial<Profile>): Promise<void>;

  // Body measurements
  getBodyMeasurements(): Promise<BodyMeasurement[]>;
  saveBodyMeasurement(measurement: Omit<BodyMeasurement, 'id' | 'user_id' | 'created_at'>): Promise<void>;
  deleteBodyMeasurement(id: string): Promise<void>;

  // Measurements
  getMeasurements(): Promise<Measurement[]>;
  saveMeasurement(measurement: Omit<Measurement, 'id' | 'user_id' | 'created_at'>): Promise<void>;
  deleteMeasurement(id: string): Promise<void>;

  // Strength records
  getStrengthRecords(): Promise<StrengthRecord[]>;
  saveStrengthRecord(record: Omit<StrengthRecord, 'id' | 'user_id' | 'created_at'>): Promise<void>;
  deleteStrengthRecord(id: string): Promise<void>;

  // Progress images
  getProgressImages(): Promise<ProgressImage[]>;
  saveProgressImage(image: Omit<ProgressImage, 'id' | 'user_id' | 'created_at'>): Promise<void>;
  deleteProgressImage(id: string): Promise<void>;
  toggleImageFavorite(id: string): Promise<void>;

  // Habits
  getHabits(): Promise<Habit[]>;
  saveHabit(habit: Omit<Habit, 'id' | 'user_id' | 'created_at'>): Promise<void>;
  deleteHabit(id: string): Promise<void>;

  // Habit completions
  getHabitCompletions(): Promise<HabitCompletion[]>;
  saveHabitCompletion(completion: Omit<HabitCompletion, 'id' | 'user_id' | 'created_at'>): Promise<void>;
  toggleHabitCompletion(habitId: string, date: string, count?: number): Promise<void>;

  // Nutrition
  getNutritionRecords(): Promise<NutritionRecord[]>;
  getNutritionRecord(date: string): Promise<NutritionRecord | null>;
  saveNutritionRecord(record: Omit<NutritionRecord, 'id' | 'user_id' | 'created_at'>): Promise<void>;

  // Supplements
  getSupplements(): Promise<Supplement[]>;
  saveSupplements(supplements: Omit<Supplement, 'id' | 'user_id' | 'created_at'>[]): Promise<void>;
  
  // Supplement completions
  getSupplementCompletions(): Promise<SupplementCompletion[]>;
  toggleSupplementCompletion(supplementId: string, date: string): Promise<void>;

  // Workout plans
  getWorkoutPlans(): Promise<WorkoutPlan[]>;
  saveWorkoutPlan(plan: Omit<WorkoutPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<void>;

  // Data migration
  migrateLocalStorageData(): Promise<void>;
}

class SupabaseStorageServiceImpl implements SupabaseStorageService {
  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return user.id;
  }

  // Profile methods
  async getProfile(): Promise<Profile | null> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  async updateProfile(profile: Partial<Profile>): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from('profiles')
      .upsert({ ...profile, id: userId, updated_at: new Date().toISOString() });
    
    if (error) throw error;
  }

  // Body measurements
  async getBodyMeasurements(): Promise<BodyMeasurement[]> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async saveBodyMeasurement(measurement: Omit<BodyMeasurement, 'id' | 'user_id' | 'created_at'>): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from('body_measurements')
      .upsert({ ...measurement, user_id: userId });
    
    if (error) throw error;
  }

  async deleteBodyMeasurement(id: string): Promise<void> {
    const { error } = await supabase
      .from('body_measurements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Measurements
  async getMeasurements(): Promise<Measurement[]> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async saveMeasurement(measurement: Omit<Measurement, 'id' | 'user_id' | 'created_at'>): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from('measurements')
      .upsert({ ...measurement, user_id: userId });
    
    if (error) throw error;
  }

  async deleteMeasurement(id: string): Promise<void> {
    const { error } = await supabase
      .from('measurements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Strength records
  async getStrengthRecords(): Promise<StrengthRecord[]> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('strength_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async saveStrengthRecord(record: Omit<StrengthRecord, 'id' | 'user_id' | 'created_at'>): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from('strength_records')
      .upsert({ ...record, user_id: userId });
    
    if (error) throw error;
  }

  async deleteStrengthRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from('strength_records')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Progress images
  async getProgressImages(): Promise<ProgressImage[]> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('progress_images')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async saveProgressImage(image: Omit<ProgressImage, 'id' | 'user_id' | 'created_at'>): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from('progress_images')
      .insert({ ...image, user_id: userId });
    
    if (error) throw error;
  }

  async deleteProgressImage(id: string): Promise<void> {
    const { error } = await supabase
      .from('progress_images')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async toggleImageFavorite(id: string): Promise<void> {
    const { data } = await supabase
      .from('progress_images')
      .select('is_favorite')
      .eq('id', id)
      .single();
    
    const { error } = await supabase
      .from('progress_images')
      .update({ is_favorite: !data?.is_favorite })
      .eq('id', id);
    
    if (error) throw error;
  }

  // Habits
  async getHabits(): Promise<Habit[]> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  }

  async saveHabit(habit: Omit<Habit, 'id' | 'user_id' | 'created_at'>): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from('habits')
      .upsert({ ...habit, user_id: userId });
    
    if (error) throw error;
  }

  async deleteHabit(id: string): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Habit completions
  async getHabitCompletions(): Promise<HabitCompletion[]> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  }

  async saveHabitCompletion(completion: Omit<HabitCompletion, 'id' | 'user_id' | 'created_at'>): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from('habit_completions')
      .upsert({ ...completion, user_id: userId });
    
    if (error) throw error;
  }

  async toggleHabitCompletion(habitId: string, date: string, count: number = 1): Promise<void> {
    const userId = await this.getCurrentUserId();
    
    const { data: existing } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', habitId)
      .eq('date', date)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('habit_completions')
        .insert({ habit_id: habitId, date, count, user_id: userId });
      if (error) throw error;
    }
  }

  // Nutrition
  async getNutritionRecords(): Promise<NutritionRecord[]> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('nutrition_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getNutritionRecord(date: string): Promise<NutritionRecord | null> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('nutrition_records')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  async saveNutritionRecord(record: Omit<NutritionRecord, 'id' | 'user_id' | 'created_at'>): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from('nutrition_records')
      .upsert({ ...record, user_id: userId });
    
    if (error) throw error;
  }

  // Supplements
  async getSupplements(): Promise<Supplement[]> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('supplements')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  }

  async saveSupplements(supplements: Omit<Supplement, 'id' | 'user_id' | 'created_at'>[]): Promise<void> {
    const userId = await this.getCurrentUserId();
    const supplementsWithUserId = supplements.map(supplement => ({
      ...supplement,
      user_id: userId
    }));
    
    const { error } = await supabase
      .from('supplements')
      .upsert(supplementsWithUserId);
    
    if (error) throw error;
  }

  // Supplement completions
  async getSupplementCompletions(): Promise<SupplementCompletion[]> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('supplement_completions')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  }

  async toggleSupplementCompletion(supplementId: string, date: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    
    const { data: existing } = await supabase
      .from('supplement_completions')
      .select('*')
      .eq('supplement_id', supplementId)
      .eq('date', date)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('supplement_completions')
        .update({ taken: !existing.taken })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('supplement_completions')
        .insert({ supplement_id: supplementId, date, taken: true, user_id: userId });
      if (error) throw error;
    }
  }

  // Workout plans
  async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  }

  async saveWorkoutPlan(plan: Omit<WorkoutPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await supabase
      .from('workout_plans')
      .upsert({ 
        ...plan, 
        user_id: userId,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
  }

  // Data migration from localStorage
  async migrateLocalStorageData(): Promise<void> {
    console.log('Starting localStorage migration to Supabase...');
    
    try {
      // Import existing storageService to get localStorage data
      const { storageService } = await import('./storageService');
      
      // Migrate profile data
      const localPersonalData = localStorage.getItem('personalData');
      if (localPersonalData) {
        const personalData = JSON.parse(localPersonalData);
        await this.updateProfile({
          name: personalData.name,
          age: personalData.age,
          height: personalData.height,
          weight: personalData.weight,
          body_fat: personalData.bodyFat,
          calories: personalData.calories,
          protein: personalData.protein,
          sleep: personalData.sleep,
          training_days: personalData.trainingDays
        });
      }

      // Migrate habits
      const localHabits = storageService.getHabits();
      if (localHabits.length > 0) {
        for (const habit of localHabits) {
          await this.saveHabit({
            name: habit.name,
            icon: habit.icon,
            target: habit.target,
            description: habit.description || ''
          });
        }
      }

      // Migrate body measurements
      const localBodyMeasurements = storageService.getBodyMeasurements();
      if (localBodyMeasurements.length > 0) {
        for (const measurement of localBodyMeasurements) {
          await this.saveBodyMeasurement({
            date: measurement.date,
            weight: measurement.weight,
            height: measurement.height,
            body_fat: measurement.bodyFat,
            muscle_mass: measurement.muscleMass,
            chest: measurement.chest,
            waist: measurement.waist,
            arms: measurement.arms,
            thighs: measurement.thighs,
            shoulders: measurement.shoulders,
            notes: measurement.notes
          });
        }
      }

      // Migrate measurements
      const localMeasurements = storageService.getMeasurements();
      if (localMeasurements.length > 0) {
        for (const measurement of localMeasurements) {
          await this.saveMeasurement({
            date: measurement.date,
            chest: measurement.chest,
            waist: measurement.waist,
            hips: measurement.hips,
            armumfang: measurement.armumfang,
            thigh: measurement.thigh,
            neck: measurement.neck,
            shoulders: measurement.shoulders,
            forearm: measurement.forearm
          });
        }
      }

      // Migrate strength records
      const localStrengthData = storageService.getStrengthData();
      if (localStrengthData.length > 0) {
        for (const record of localStrengthData) {
          await this.saveStrengthRecord({
            date: record.date,
            exercise: record.exercise,
            sets: record.sets,
            reps: record.reps,
            weight: record.weight,
            notes: record.notes
          });
        }
      }

      // Migrate supplements
      const localSupplements = storageService.getSupplements();
      if (localSupplements.length > 0) {
        const supplementsToMigrate = localSupplements.map(supplement => ({
          name: supplement.name,
          dosage: supplement.dosage,
          timing: supplement.timing,
          category: supplement.category,
          icon: supplement.icon,
          color: supplement.color
        }));
        await this.saveSupplements(supplementsToMigrate);
      }

      // Migrate workout plan
      const localWorkout = storageService.getWorkoutData();
      if (localWorkout) {
        await this.saveWorkoutPlan({
          split_name: localWorkout.splitName,
          days: localWorkout.days,
          supplements: localWorkout.supplements,
          nutrition: localWorkout.nutrition
        });
      }

      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }
}

export const supabaseStorageService = new SupabaseStorageServiceImpl();
