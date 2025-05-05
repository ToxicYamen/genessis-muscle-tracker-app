
export interface User {
  username: string;
  password: string;
}

export interface MuscleGroup {
  name: string;
  measurements: MeasurementRecord[];
  goals: MuscleGoal[];
}

export interface MeasurementRecord {
  date: string;
  value: number;
}

export interface MuscleGoal {
  age: number;
  startValue: number;
  endValue: number;
  extraGain: number;
  targetValue: number;
}

export interface ExerciseStrength {
  name: string;
  records: StrengthRecord[];
  naturalTarget: number;
  enhancedTarget: number;
}

export interface StrengthRecord {
  date: string;
  value: number;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: string[];
}

export interface PersonalData {
  name: string;
  age: number;
  height: number;
  weight: number;
  bodyFat: number;
  calories: number;
  protein: number;
  sleep: number;
  trainingDays: number;
}

export interface Milestone {
  age: number;
  weight: number;
  armSize: number;
  shoulderSize: number;
  bodyFat: string;
  note: string;
}

export type ChartData = {
  name: string;
  value: number;
  target?: number;
};
