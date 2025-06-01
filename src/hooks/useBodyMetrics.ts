import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useTrackingData } from '../contexts/DataContext';
import { eventService, EVENTS } from '../services/eventService';

export function useBodyMetrics() {
  const { height, setHeight, weight, setWeight, bodyFat, setBodyFat } = useStore();
  const { personalData, updatePersonalData, addMeasurement } = useTrackingData();

  // Initialen State aus den Profildaten laden und auf Änderungen reagieren
  useEffect(() => {
    if (personalData) {
      // Initialisiere den Store mit den Werten aus personalData
      useStore.getState().initialize({
        height: personalData.height,
        weight: personalData.weight,
        bodyFat: personalData.bodyFat
      });
    }
  }, [personalData]);

  // Auf Änderungen im Store reagieren und personalData aktualisieren
  useEffect(() => {
    if (height !== null && weight !== null && bodyFat !== null) {
      updatePersonalData({
        height,
        weight,
        bodyFat
      }).catch(console.error);
    }
  }, [height, weight, bodyFat, updatePersonalData]);

  // Event-Listener für Aktualisierungen
  useEffect(() => {
    const updateFromEvent = (e: CustomEvent) => {
      const { type, value } = e.detail;
      if (type === 'height') setHeight(value);
      if (type === 'weight') setWeight(value);
      if (type === 'bodyFat') setBodyFat(value);
    };

    // @ts-ignore - CustomEvent Typ ist nicht korrekt erkannt
    eventService.on(EVENTS.HEIGHT_UPDATED, updateFromEvent);
    // @ts-ignore
    eventService.on(EVENTS.WEIGHT_UPDATED, updateFromEvent);
    // @ts-ignore
    eventService.on(EVENTS.BODY_FAT_UPDATED, updateFromEvent);

    return () => {
      // @ts-ignore
      eventService.off(EVENTS.HEIGHT_UPDATED, updateFromEvent);
      // @ts-ignore
      eventService.off(EVENTS.WEIGHT_UPDATED, updateFromEvent);
      // @ts-ignore
      eventService.off(EVENTS.BODY_FAT_UPDATED, updateFromEvent);
    };
  }, [setHeight, setWeight, setBodyFat]);

  const updateMetric = async (type: 'height' | 'weight' | 'bodyFat', value: number) => {
    try {
      // Zuerst die Messung hinzufügen (dies aktualisiert auch die persönlichen Daten)
      await addMeasurement(
        type === 'height' ? 'Größe' : 
        type === 'weight' ? 'Gewicht' : 'Körperfett',
        {
          date: new Date().toISOString(),
          value,
        }
      );

      // Dann den lokalen State aktualisieren
      if (type === 'height') setHeight(value);
      if (type === 'weight') setWeight(value);
      if (type === 'bodyFat') setBodyFat(value);

      // Event auslösen
      eventService.emit(
        type === 'height' ? EVENTS.HEIGHT_UPDATED :
        type === 'weight' ? EVENTS.WEIGHT_UPDATED :
        EVENTS.BODY_FAT_UPDATED,
        { type, value }
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Metriken:', error);
      throw error;
    }
  };

  return {
    height,
    weight,
    bodyFat,
    updateMetric,
  };
}
