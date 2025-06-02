import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  updated_at?: string;
}

export interface BodyMeasurement {
  id?: string;
  date: string;
  weight: number;
  height: number;
  body_fat?: number;
  muscle_mass?: number;
  user_id?: string;
}

export interface Measurement {
  id?: string;
  date: string;
  chest?: number;
  waist?: number;
  hips?: number;
  arm_left?: number;
  arm_right?: number;
  leg_left?: number;
  leg_right?: number;
  user_id?: string;
}

export interface StrengthRecord {
  id?: string;
  date: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  user_id?: string;
}

export interface ProgressImage {
  id?: string;
  date: string;
  image_url: string;
  description?: string;
  user_id?: string;
}

export interface Habit {
  id?: string;
  name: string;
  description?: string;
  frequency: string;
  goal: number;
  user_id?: string;
}

export interface HabitCompletion {
  id?: string;
  habit_id: string;
  date: string;
  quantity: number;
  completed: boolean;
  user_id?: string;
}

export interface NutritionRecord {
  id?: string;
  date: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  user_id?: string;
}

export interface Supplement {
  id?: string;
  name: string;
  dosage: string;
  time: string;
  user_id?: string;
}

export interface SupplementCompletion {
  id?: string;
  supplement_id: string;
  date: string;
  taken: boolean;
  user_id?: string;
}

export interface WorkoutPlan {
  id?: string;
  name: string;
  description?: string;
  days: any[];
  nutrition: any[];
  user_id?: string;
}

export const supabaseStorageService = {
  // Profiles
  async saveProfile(profileData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return data;
  },

  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Body Measurements
  async saveBodyMeasurements(measurements: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const measurementsWithUserId = measurements.map(measurement => ({
      ...measurement,
      user_id: user.id
    }));

    const { data, error } = await supabase
      .from('body_measurements')
      .upsert(measurementsWithUserId);

    if (error) throw error;
    return data;
  },

  async getBodyMeasurements() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Measurements
  async saveMeasurements(measurements: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const measurementsWithUserId = measurements.map(measurement => ({
      ...measurement,
      user_id: user.id
    }));

    const { data, error } = await supabase
      .from('measurements')
      .upsert(measurementsWithUserId);

    if (error) throw error;
    return data;
  },

  async getMeasurements() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Strength Records
  async saveStrengthRecords(records: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const recordsWithUserId = records.map(record => ({
      ...record,
      user_id: user.id
    }));

    const { data, error } = await supabase
      .from('strength_records')
      .upsert(recordsWithUserId);

    if (error) throw error;
    return data;
  },

  async getStrengthRecords() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('strength_records')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Progress Images
  async saveProgressImages(images: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const imagesWithUserId = images.map(image => ({
      ...image,
      user_id: user.id
    }));

    const { data, error } = await supabase
      .from('progress_images')
      .upsert(imagesWithUserId);

    if (error) throw error;
    return data;
  },

  async getProgressImages() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('progress_images')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Habits
  async saveHabits(habits: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const habitsWithUserId = habits.map(habit => ({
      ...habit,
      user_id: user.id
    }));

    const { data, error } = await supabase
      .from('habits')
      .upsert(habitsWithUserId);

    if (error) throw error;
    return data;
  },

  async getHabits() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data || [];
  },

  // Habit Completions
  async saveHabitCompletions(completions: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const completionsWithUserId = completions.map(completion => ({
      ...completion,
      user_id: user.id
    }));

    const { data, error } = await supabase
      .from('habit_completions')
      .upsert(completionsWithUserId);

    if (error) throw error;
    return data;
  },

  async getHabitCompletions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data || [];
  },

  // Nutrition Records
  async saveNutritionRecords(records: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const recordsWithUserId = records.map(record => ({
      ...record,
      user_id: user.id
    }));

    const { data, error } = await supabase
      .from('nutrition_records')
      .upsert(recordsWithUserId);

    if (error) throw error;
    return data;
  },

  async getNutritionRecords() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('nutrition_records')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Supplements
  async saveSupplements(supplements: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const supplementsWithUserId = supplements.map(supplement => ({
      ...supplement,
      user_id: user.id
    }));

    const { data, error } = await supabase
      .from('supplements')
      .upsert(supplementsWithUserId);

    if (error) throw error;
    return data;
  },

  async getSupplements() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('supplements')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data || [];
  },

  // Supplement Completions
  async saveSupplementCompletions(completions: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const completionsWithUserId = completions.map(completion => ({
      ...completion,
      user_id: user.id
    }));

    const { data, error } = await supabase
      .from('supplement_completions')
      .upsert(completionsWithUserId);

    if (error) throw error;
    return data;
  },

  async getSupplementCompletions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('supplement_completions')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data || [];
  },

  // Workout Plans
  async saveWorkoutPlans(plans: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const plansWithUserId = plans.map(plan => ({
      ...plan,
      user_id: user.id,
      days: JSON.stringify(plan.days),
      nutrition: JSON.stringify(plan.nutrition)
    }));

    const { data, error } = await supabase
      .from('workout_plans')
      .upsert(plansWithUserId);

    if (error) throw error;
    return data;
  },

  async getWorkoutPlans() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    
    return (data || []).map(plan => ({
      ...plan,
      days: typeof plan.days === 'string' ? JSON.parse(plan.days) : plan.days,
      nutrition: typeof plan.nutrition === 'string' ? JSON.parse(plan.nutrition) : plan.nutrition
    }));
  },

  // Migration function
  async migrateLocalStorageData() {
    console.log('Starting localStorage migration to Supabase...');
    
    try {
      // Get all localStorage data
      const profileData = localStorage.getItem('profile');
      const bodyMeasurementsData = localStorage.getItem('bodyMeasurements');
      const measurementsData = localStorage.getItem('measurements');
      const strengthData = localStorage.getItem('strengthData');
      const progressImagesData = localStorage.getItem('progressImages');
      const habitsData = localStorage.getItem('habits');
      const habitCompletionsData = localStorage.getItem('habitCompletions');
      const nutritionData = localStorage.getItem('nutritionData');
      const supplementsData = localStorage.getItem('supplements');
      const supplementCompletionsData = localStorage.getItem('supplementCompletions');
      const workoutPlansData = localStorage.getItem('workoutPlans');

      // Migrate profile
      if (profileData) {
        await this.saveProfile(JSON.parse(profileData));
        console.log('Profile data migrated');
      }

      // Migrate body measurements
      if (bodyMeasurementsData) {
        await this.saveBodyMeasurements(JSON.parse(bodyMeasurementsData));
        console.log('Body measurements migrated');
      }

      // Migrate measurements
      if (measurementsData) {
        await this.saveMeasurements(JSON.parse(measurementsData));
        console.log('Measurements migrated');
      }

      // Migrate strength data
      if (strengthData) {
        await this.saveStrengthRecords(JSON.parse(strengthData));
        console.log('Strength data migrated');
      }

      // Migrate progress images
      if (progressImagesData) {
        await this.saveProgressImages(JSON.parse(progressImagesData));
        console.log('Progress images migrated');
      }

      // Migrate habits
      if (habitsData) {
        await this.saveHabits(JSON.parse(habitsData));
        console.log('Habits migrated');
      }

      // Migrate habit completions
      if (habitCompletionsData) {
        await this.saveHabitCompletions(JSON.parse(habitCompletionsData));
        console.log('Habit completions migrated');
      }

      // Migrate nutrition data
      if (nutritionData) {
        await this.saveNutritionRecords(JSON.parse(nutritionData));
        console.log('Nutrition data migrated');
      }

      // Migrate supplements
      if (supplementsData) {
        await this.saveSupplements(JSON.parse(supplementsData));
        console.log('Supplements migrated');
      }

      // Migrate supplement completions
      if (supplementCompletionsData) {
        await this.saveSupplementCompletions(JSON.parse(supplementCompletionsData));
        console.log('Supplement completions migrated');
      }

      // Migrate workout plans
      if (workoutPlansData) {
        await this.saveWorkoutPlans(JSON.parse(workoutPlansData));
        console.log('Workout plans migrated');
      }

      console.log('Migration completed successfully!');
      
      // Clear localStorage after successful migration
      localStorage.removeItem('profile');
      localStorage.removeItem('bodyMeasurements');
      localStorage.removeItem('measurements');
      localStorage.removeItem('strengthData');
      localStorage.removeItem('progressImages');
      localStorage.removeItem('habits');
      localStorage.removeItem('habitCompletions');
      localStorage.removeItem('nutritionData');
      localStorage.removeItem('supplements');
      localStorage.removeItem('supplementCompletions');
      localStorage.removeItem('workoutPlans');
      
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
};
