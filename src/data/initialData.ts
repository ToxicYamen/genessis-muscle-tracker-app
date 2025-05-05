
import { 
  MuscleGroup, 
  ExerciseStrength, 
  WorkoutDay, 
  PersonalData,
  Milestone 
} from "../types";

export const personalData: PersonalData = {
  name: "Yamen",
  age: 18,
  height: 185,
  weight: 70,
  bodyFat: 9.5,
  calories: 4864,
  protein: 280,
  sleep: 10,
  trainingDays: 6
};

export const muscleGroups: MuscleGroup[] = [
  {
    name: "Bizeps",
    measurements: [],
    goals: [
      { age: 19, startValue: 35, endValue: 38, extraGain: 1, targetValue: 39 },
      { age: 20, startValue: 38, endValue: 40, extraGain: 2, targetValue: 42 },
      { age: 21, startValue: 40, endValue: 43, extraGain: 2, targetValue: 45 },
      { age: 22, startValue: 43, endValue: 45, extraGain: 2, targetValue: 47 }
    ]
  },
  {
    name: "Trizeps",
    measurements: [],
    goals: [
      { age: 19, startValue: 32, endValue: 34, extraGain: 1, targetValue: 35 },
      { age: 20, startValue: 34, endValue: 36, extraGain: 2, targetValue: 38 },
      { age: 21, startValue: 36, endValue: 39, extraGain: 2, targetValue: 41 },
      { age: 22, startValue: 39, endValue: 41, extraGain: 2, targetValue: 43 }
    ]
  },
  {
    name: "Schultern",
    measurements: [],
    goals: [
      { age: 19, startValue: 43, endValue: 45, extraGain: 1, targetValue: 46 },
      { age: 20, startValue: 45, endValue: 47, extraGain: 1, targetValue: 48 },
      { age: 21, startValue: 47, endValue: 49, extraGain: 1, targetValue: 50 },
      { age: 22, startValue: 49, endValue: 51, extraGain: 1, targetValue: 52 }
    ]
  },
  {
    name: "Brust",
    measurements: [],
    goals: [
      { age: 19, startValue: 38, endValue: 40, extraGain: 1, targetValue: 41 },
      { age: 20, startValue: 40, endValue: 43, extraGain: 1, targetValue: 44 },
      { age: 21, startValue: 43, endValue: 45, extraGain: 1, targetValue: 46 },
      { age: 22, startValue: 45, endValue: 46, extraGain: 1, targetValue: 47 }
    ]
  },
  {
    name: "Rücken",
    measurements: [],
    goals: [
      { age: 19, startValue: 70, endValue: 76, extraGain: 1, targetValue: 77 },
      { age: 20, startValue: 76, endValue: 80, extraGain: 2, targetValue: 82 },
      { age: 21, startValue: 80, endValue: 84, extraGain: 2, targetValue: 86 },
      { age: 22, startValue: 84, endValue: 88, extraGain: 2, targetValue: 90 }
    ]
  },
  {
    name: "Beine",
    measurements: [],
    goals: [
      { age: 19, startValue: 56, endValue: 58, extraGain: 1, targetValue: 59 },
      { age: 20, startValue: 58, endValue: 60, extraGain: 2, targetValue: 62 },
      { age: 21, startValue: 60, endValue: 64, extraGain: 1, targetValue: 65 },
      { age: 22, startValue: 64, endValue: 66, extraGain: 1, targetValue: 67 }
    ]
  },
  {
    name: "Waden",
    measurements: [],
    goals: [
      { age: 19, startValue: 37, endValue: 38, extraGain: 1, targetValue: 39 },
      { age: 20, startValue: 38, endValue: 39, extraGain: 1, targetValue: 40 },
      { age: 21, startValue: 39, endValue: 41, extraGain: 1, targetValue: 42 },
      { age: 22, startValue: 41, endValue: 42, extraGain: 1, targetValue: 43 }
    ]
  },
  {
    name: "Nacken/Trapez",
    measurements: [],
    goals: [
      { age: 19, startValue: 39, endValue: 40, extraGain: 1, targetValue: 41 },
      { age: 20, startValue: 40, endValue: 42, extraGain: 1, targetValue: 43 },
      { age: 21, startValue: 42, endValue: 44, extraGain: 1, targetValue: 45 },
      { age: 22, startValue: 44, endValue: 45, extraGain: 1, targetValue: 46 }
    ]
  }
];

export const strengthExercises: ExerciseStrength[] = [
  {
    name: "Bankdrücken (1RM)",
    records: [],
    naturalTarget: 150,
    enhancedTarget: 170
  },
  {
    name: "Schrägbank Hanteln",
    records: [],
    naturalTarget: 55,
    enhancedTarget: 60
  },
  {
    name: "Einarmiger Latzug",
    records: [],
    naturalTarget: 110,
    enhancedTarget: 120
  },
  {
    name: "Rudern (Langhantel)",
    records: [],
    naturalTarget: 140,
    enhancedTarget: 150
  },
  {
    name: "Bizeps-Curls (beidarmig)",
    records: [],
    naturalTarget: 120,
    enhancedTarget: 130
  },
  {
    name: "Trizeps Pushdowns",
    records: [],
    naturalTarget: 130,
    enhancedTarget: 150
  },
  {
    name: "Kniebeugen (Smith)",
    records: [],
    naturalTarget: 170,
    enhancedTarget: 180
  },
  {
    name: "Beinpresse (90°)",
    records: [],
    naturalTarget: 180,
    enhancedTarget: 190
  }
];

export const workoutSplit: WorkoutDay[] = [
  {
    day: "Montag",
    focus: "Brust & Rücken",
    exercises: [
      "Bankdrücken",
      "Schrägbank Hanteln",
      "Incline Dumbell Press",
      "Einarmiger Latzug (Maschine)",
      "Rudern (Langhantel)",
      "Face Pulls",
      "Seitheben (Maschine)"
    ]
  },
  {
    day: "Dienstag",
    focus: "Arme",
    exercises: [
      "Bizeps-Curls (beidarmig)",
      "Einarmige Curls (Preacher)",
      "Cable Curl (tiefen Block)",
      "Trizeps Pushdowns",
      "Dips",
      "Rope Pushdowns",
      "Supination Curls"
    ]
  },
  {
    day: "Mittwoch",
    focus: "Beine",
    exercises: [
      "Kniebeugen (Smith)",
      "Beinpresse (90°)",
      "Rumänische Kreuzheben",
      "Ausfallschritte",
      "Wadenheben",
      "Beinbeuger"
    ]
  },
  {
    day: "Donnerstag",
    focus: "Brust & Rücken",
    exercises: [
      "Flachbankdrücken",
      "Kabelkreuz",
      "Latzug eng",
      "One-arm Rows",
      "Shrugs",
      "Unterarmcurls"
    ]
  },
  {
    day: "Freitag",
    focus: "Arme",
    exercises: [
      "Hammercurls",
      "Overhead Trizeps",
      "Skull Crushers",
      "Cable Curls",
      "Preacher Curls",
      "Trizepsdrücken"
    ]
  },
  {
    day: "Samstag",
    focus: "Beine / Regeneration",
    exercises: [
      "Waden",
      "Beinbeuger",
      "Ausfallschritte",
      "Optional: Yoga, Spaziergang, Dehnung"
    ]
  }
];

export const milestones: Milestone[] = [
  {
    age: 19,
    weight: 81,
    armSize: 38,
    shoulderSize: 45,
    bodyFat: "12-14%",
    note: "Grundlagen stabilisiert"
  },
  {
    age: 20,
    weight: 85,
    armSize: 40,
    shoulderSize: 47,
    bodyFat: "13-15%",
    note: "Ästhetische Proportionen"
  },
  {
    age: 21,
    weight: 89,
    armSize: 43,
    shoulderSize: 49,
    bodyFat: "14-16%",
    note: "Bild 1-ähnlich"
  },
  {
    age: 22,
    weight: 91,
    armSize: 45,
    shoulderSize: 51,
    bodyFat: "15-17%",
    note: "Maximaler Natural-Gain"
  }
];

export const defaultUser = {
  username: "yamen",
  password: "muscle123"
};
