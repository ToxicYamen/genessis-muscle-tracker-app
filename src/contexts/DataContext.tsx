
import React, { createContext, useContext, useState, useEffect } from "react";
import { MuscleGroup, ExerciseStrength, WorkoutDay, PersonalData, Milestone, MeasurementRecord, StrengthRecord } from "../types";
import { muscleGroups, strengthExercises, workoutSplit, personalData, milestones } from "../data/initialData";
import { toast } from "@/components/ui/use-toast";

interface DataContextProps {
  personalData: PersonalData;
  updatePersonalData: (data: PersonalData) => void;
  muscleGroups: MuscleGroup[];
  addMeasurement: (groupName: string, measurement: MeasurementRecord) => void;
  strengthExercises: ExerciseStrength[];
  addStrengthRecord: (exerciseName: string, record: StrengthRecord) => void;
  workoutSplit: WorkoutDay[];
  milestones: Milestone[];
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [personalDataState, setPersonalDataState] = useState<PersonalData>(personalData);
  const [muscleGroupsState, setMuscleGroupsState] = useState<MuscleGroup[]>(muscleGroups);
  const [strengthExercisesState, setStrengthExercisesState] = useState<ExerciseStrength[]>(strengthExercises);
  const [workoutSplitState] = useState<WorkoutDay[]>(workoutSplit);
  const [milestonesState] = useState<Milestone[]>(milestones);

  useEffect(() => {
    // Load data from localStorage if available
    const storedPersonalData = localStorage.getItem("personalData");
    const storedMuscleGroups = localStorage.getItem("muscleGroups");
    const storedStrengthExercises = localStorage.getItem("strengthExercises");

    if (storedPersonalData) {
      setPersonalDataState(JSON.parse(storedPersonalData));
    }
    if (storedMuscleGroups) {
      setMuscleGroupsState(JSON.parse(storedMuscleGroups));
    }
    if (storedStrengthExercises) {
      setStrengthExercisesState(JSON.parse(storedStrengthExercises));
    }
  }, []);

  const updatePersonalData = (data: PersonalData) => {
    setPersonalDataState(data);
    localStorage.setItem("personalData", JSON.stringify(data));
    toast({
      title: "Daten aktualisiert",
      description: "Deine persönlichen Daten wurden gespeichert.",
    });
  };

  const addMeasurement = (groupName: string, measurement: MeasurementRecord) => {
    setMuscleGroupsState(prevGroups => {
      const newGroups = prevGroups.map(group => {
        if (group.name === groupName) {
          // Check if measurement for this date already exists
          const existingIndex = group.measurements.findIndex(
            m => m.date === measurement.date
          );
          
          // Update personal data if it's weight, height or body fat
          if (groupName === 'Gewicht') {
            updatePersonalData({
              ...personalDataState,
              weight: measurement.value
            });
          } else if (groupName === 'Größe') {
            updatePersonalData({
              ...personalDataState,
              height: measurement.value
            });
          } else if (groupName === 'Körperfett') {
            updatePersonalData({
              ...personalDataState,
              bodyFat: measurement.value
            });
          }
          
          if (existingIndex >= 0) {
            // Update existing measurement
            const updatedMeasurements = [...group.measurements];
            updatedMeasurements[existingIndex] = measurement;
            return {
              ...group,
              measurements: updatedMeasurements
            };
          } else {
            // Add new measurement
            return {
              ...group,
              measurements: [...group.measurements, measurement].sort((a, b) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
              )
            };
          }
        }
        return group;
      });
      
      localStorage.setItem("muscleGroups", JSON.stringify(newGroups));
      return newGroups;
    });
    
    toast({
      title: "Messung hinzugefügt",
      description: `Neue Messung für ${groupName} wurde gespeichert.`,
    });
  };

  const addStrengthRecord = (exerciseName: string, record: StrengthRecord) => {
    setStrengthExercisesState(prevExercises => {
      const newExercises = prevExercises.map(exercise => {
        if (exercise.name === exerciseName) {
          // Check if record for this date already exists
          const existingIndex = exercise.records.findIndex(
            r => r.date === record.date
          );
          
          if (existingIndex >= 0) {
            // Update existing record
            const updatedRecords = [...exercise.records];
            updatedRecords[existingIndex] = record;
            return {
              ...exercise,
              records: updatedRecords
            };
          } else {
            // Add new record
            return {
              ...exercise,
              records: [...exercise.records, record].sort((a, b) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
              )
            };
          }
        }
        return exercise;
      });
      
      localStorage.setItem("strengthExercises", JSON.stringify(newExercises));
      return newExercises;
    });
    
    toast({
      title: "Kraftwert hinzugefügt",
      description: `Neuer Kraftwert für ${exerciseName} wurde gespeichert.`,
    });
  };

  return (
    <DataContext.Provider 
      value={{ 
        personalData: personalDataState, 
        updatePersonalData,
        muscleGroups: muscleGroupsState, 
        addMeasurement,
        strengthExercises: strengthExercisesState, 
        addStrengthRecord,
        workoutSplit: workoutSplitState,
        milestones: milestonesState
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useTrackingData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useTrackingData must be used within a DataProvider");
  }
  return context;
};
