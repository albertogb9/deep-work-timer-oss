// Timer-related type definitions

export interface TimerState {
  minutesTens: number;
  minutesUnits: number;
  secondsTens: number;
  secondsUnits: number;
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number;
  initialTime: number;
  timerTitle: string;
  isEditingTitle: boolean;
}

export interface TimerActions {
  incrementMinutesTens: () => void;
  decrementMinutesTens: () => void;
  incrementMinutesUnits: () => void;
  decrementMinutesUnits: () => void;
  incrementSecondsTens: () => void;
  decrementSecondsTens: () => void;
  incrementSecondsUnits: () => void;
  decrementSecondsUnits: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  endTimer: () => Promise<void>;
  setTimerTitle: (title: string) => void;
  setIsEditingTitle: (editing: boolean) => void;
}

export interface TimerUtils {
  getTotalTimeInSeconds: () => number;
  getProgress: () => number;
  formatTime: (seconds: number) => string;
}

export type TimerHook = TimerState & TimerActions & TimerUtils;