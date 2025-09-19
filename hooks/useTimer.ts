import { useState, useEffect, useCallback } from 'react';
import { TimerHook } from '../types';
import { NotificationService } from '../services';
import { databaseService } from '../services';

/**
 * Custom hook for timer functionality
 * Separates business logic from UI components
 */
export const useTimer = (): TimerHook => {
  // Timer state
  const [minutesTens, setMinutesTens] = useState(0);
  const [minutesUnits, setMinutesUnits] = useState(0);
  const [secondsTens, setSecondsTens] = useState(0);
  const [secondsUnits, setSecondsUnits] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [timerTitle, setTimerTitle] = useState('Deep Work');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Utility functions
  const getTotalTimeInSeconds = useCallback(() => {
    const totalMinutes = minutesTens * 10 + minutesUnits;
    const totalSeconds = secondsTens * 10 + secondsUnits;
    return (totalMinutes * 60 + totalSeconds);
  }, [minutesTens, minutesUnits, secondsTens, secondsUnits]);

  const getProgress = useCallback(() => {
    if (initialTime === 0) return 0;
    const elapsed = initialTime - timeRemaining + 1;
    let elapsed_percentage = (elapsed / initialTime) * 100;
    if (elapsed_percentage > 100) {
      elapsed_percentage = 0;
    }
    return elapsed_percentage;
  }, [initialTime, timeRemaining]);

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Digit manipulation functions
  const incrementMinutesTens = useCallback(() => {
    setMinutesTens(prev => prev + 1);
  }, []);

  const decrementMinutesTens = useCallback(() => {
    setMinutesTens(prev => Math.max(0, prev - 1));
  }, []);

  const incrementMinutesUnits = useCallback(() => {
    setMinutesUnits(prev => {
      if (prev === 9) {
        incrementMinutesTens();
        return 0;
      }
      return prev + 1;
    });
  }, [incrementMinutesTens]);

  const decrementMinutesUnits = useCallback(() => {
    setMinutesUnits(prev => {
      if (prev === 0 && minutesTens > 0) {
        decrementMinutesTens();
        return 9;
      }
      return Math.max(0, prev - 1);
    });
  }, [minutesTens, decrementMinutesTens]);

  const incrementSecondsTens = useCallback(() => {
    setSecondsTens(prev => {
      if (prev === 5) {
        incrementMinutesUnits();
        return 0;
      }
      return prev + 1;
    });
  }, [incrementMinutesUnits]);

  const decrementSecondsTens = useCallback(() => {
    setSecondsTens(prev => {
      if (prev === 0 && (minutesTens > 0 || minutesUnits > 0)) {
        decrementMinutesUnits();
        return 5;
      } else {
        return Math.max(0, prev - 1);
      }
    });
  }, [minutesTens, minutesUnits, decrementMinutesUnits]);

  const incrementSecondsUnits = useCallback(() => {
    setSecondsUnits(prev => {
      if (prev === 9) {
        incrementSecondsTens();
        return 0;
      }
      return prev + 1;
    });
  }, [incrementSecondsTens]);

  const decrementSecondsUnits = useCallback(() => {
    setSecondsUnits(prev => {
      if (prev === 0 && (minutesTens > 0 || minutesUnits > 0 || secondsTens > 0)) {
        decrementSecondsTens();
        return 9;
      } else {
        return Math.max(0, prev - 1);
      }
    });
  }, [minutesTens, minutesUnits, secondsTens, decrementSecondsTens]);

  // Timer control functions
  const startTimer = useCallback(() => {
    if (!isRunning && !isPaused) {
      const totalSeconds = getTotalTimeInSeconds();
      setTimeRemaining(totalSeconds);
      setInitialTime(totalSeconds);
    }
    setIsRunning(true);
    setIsPaused(false);
  }, [isRunning, isPaused, getTotalTimeInSeconds]);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsPaused(false);
    setIsRunning(false);
    setTimeRemaining(0);
    setMinutesTens(0);
    setMinutesUnits(0);
    setSecondsTens(0);
    setSecondsUnits(0);
  }, []);

  const endTimer = useCallback(async () => {
    const completedTime = initialTime - timeRemaining;
    const timeString = formatTime(completedTime);
    
    // Show notification
    await NotificationService.showTimerCompletionNotification(timeString);
    
    // Save to database
    await databaseService.saveTimer(timerTitle, completedTime);
    
    // Reset timer
    resetTimer();
  }, [initialTime, timeRemaining, timerTitle, formatTime, resetTimer]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endTimer();
            return 0;
          }
          decrementSecondsUnits();
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining, endTimer, decrementSecondsUnits]);

  return {
    // State
    minutesTens,
    minutesUnits,
    secondsTens,
    secondsUnits,
    isRunning,
    isPaused,
    timeRemaining,
    initialTime,
    timerTitle,
    isEditingTitle,
    
    // Actions
    incrementMinutesTens,
    decrementMinutesTens,
    incrementMinutesUnits,
    decrementMinutesUnits,
    incrementSecondsTens,
    decrementSecondsTens,
    incrementSecondsUnits,
    decrementSecondsUnits,
    startTimer,
    pauseTimer,
    resetTimer,
    endTimer,
    setTimerTitle,
    setIsEditingTitle,
    
    // Utils
    getTotalTimeInSeconds,
    getProgress,
    formatTime,
  };
};