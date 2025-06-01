import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  height: number | null;
  setHeight: (height: number) => void;
  weight: number | null;
  setWeight: (weight: number) => void;
  bodyFat: number | null;
  setBodyFat: (bodyFat: number) => void;
  // Initialisierungsfunktion, um Werte zu setzen
  initialize: (data: { height?: number; weight?: number; bodyFat?: number }) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      height: null,
      setHeight: (height) => set({ height }),
      weight: null,
      setWeight: (weight) => set({ weight }),
      bodyFat: null,
      setBodyFat: (bodyFat) => set({ bodyFat }),
      initialize: (data) => set({
        height: data.height ?? null,
        weight: data.weight ?? null,
        bodyFat: data.bodyFat ?? null,
      }),
    }),
    {
      name: 'body-metrics-storage', // Name für den localStorage-Eintrag
      storage: createJSONStorage(() => localStorage),
      // Nur die Werte speichern, keine Funktionen
      partialize: (state) => ({
        height: state.height,
        weight: state.weight,
        bodyFat: state.bodyFat,
      }),
    }
  )
);
