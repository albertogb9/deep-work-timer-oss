// Database-related type definitions

export interface CompletedTimer {
  id: number;
  title: string;
  duration: number;
  completed_at: string;
}

export interface DatabaseService {
  saveTimer: (title: string, duration: number) => Promise<number | undefined>;
  loadTimers: () => Promise<CompletedTimer[]>;
  getMemoryFallbackData: () => CompletedTimer[];
  clearMemoryFallback: () => void;
  resetDatabaseState: () => void;
}

export interface DayActivity {
  month: string; // keeping same name for compatibility
  count: number;
}

export interface ActivityData {
  completedTimers: CompletedTimer[];
  activityData: DayActivity[];
  selectedDay: string | null;
  selectedDayTimers: CompletedTimer[];
}

export interface ActivityActions {
  loadTimers: () => Promise<void>;
  selectDay: (day: string | null) => void;
  clearSelection: () => void;
  generateActivityData: (timers: CompletedTimer[]) => void;
}

export type ActivityHook = ActivityData & ActivityActions;