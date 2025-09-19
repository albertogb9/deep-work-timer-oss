import { useState, useEffect, useCallback } from 'react';
import { ActivityHook, CompletedTimer, DayActivity } from '../types';
import { databaseService } from '../services';

/**
 * Custom hook for activity functionality
 * Separates business logic from UI components
 */
export const useActivity = (): ActivityHook => {
  const [completedTimers, setCompletedTimers] = useState<CompletedTimer[]>([]);
  const [activityData, setActivityData] = useState<DayActivity[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedDayTimers, setSelectedDayTimers] = useState<CompletedTimer[]>([]);

  /**
   * Load timers from database
   */
  const loadTimers = useCallback(async () => {
    try {
      const timers = await databaseService.loadTimers();
      setCompletedTimers(timers);
      generateActivityData(timers);
    } catch (error) {
      console.error('Error loading timers:', error);
      setCompletedTimers([]);
      generateActivityData([]);
    }
  }, []);

  /**
   * Generate activity data for the heatmap
   */
  const generateActivityData = useCallback((timers: CompletedTimer[]) => {
    console.log('Generating activity data with timers:', timers.length);
    
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    // Create a map to count timers per day
    const dayCountMap = new Map<string, number>();
    
    // Initialize all days in the past year with 0 count
    const currentDate = new Date(oneYearAgo);
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dayCountMap.set(dateStr, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Count actual timer completions
    timers.forEach(timer => {
      const completedDate = new Date(timer.completed_at);
      const dateStr = completedDate.toISOString().split('T')[0];
      
      if (dayCountMap.has(dateStr)) {
        dayCountMap.set(dateStr, (dayCountMap.get(dateStr) || 0) + 1);
      }
    });
    
    // Convert to array format expected by the UI
    const activityArray: DayActivity[] = [];
    dayCountMap.forEach((count, dateStr) => {
      activityArray.push({
        month: dateStr, // keeping same name for compatibility
        count: count
      });
    });
    
    // Sort by date
    activityArray.sort((a, b) => a.month.localeCompare(b.month));
    
    setActivityData(activityArray);
  }, []);

  /**
   * Select a specific day to view its timers
   */
  const selectDay = useCallback((day: string | null) => {
    setSelectedDay(day);
    
    if (day) {
      // Filter timers for the selected day
      const dayTimers = completedTimers.filter(timer => {
        const timerDate = new Date(timer.completed_at).toISOString().split('T')[0];
        return timerDate === day;
      });
      setSelectedDayTimers(dayTimers);
    } else {
      setSelectedDayTimers([]);
    }
  }, [completedTimers]);

  /**
   * Clear day selection and show all timers
   */
  const clearSelection = useCallback(() => {
    setSelectedDay(null);
    setSelectedDayTimers([]);
  }, []);

  // Load timers on mount
  useEffect(() => {
    loadTimers();
  }, [loadTimers]);

  // Update selected day timers when completedTimers changes
  useEffect(() => {
    if (selectedDay) {
      selectDay(selectedDay);
    }
  }, [completedTimers, selectedDay, selectDay]);

  return {
    // State
    completedTimers,
    activityData,
    selectedDay,
    selectedDayTimers,
    
    // Actions
    loadTimers,
    selectDay,
    clearSelection,
    generateActivityData,
  };
};