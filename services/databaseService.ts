import { 
  saveTimerToDatabase, 
  loadTimersFromDatabase, 
  getMemoryFallbackData, 
  clearMemoryFallback, 
  resetDatabaseState 
} from '../utils/database';
import { CompletedTimer, DatabaseService } from '../types';

/**
 * Database service wrapper providing a clean interface for database operations
 */
export class DatabaseServiceImpl implements DatabaseService {
  /**
   * Save a completed timer to the database
   */
  async saveTimer(title: string, duration: number): Promise<number | undefined> {
    try {
      return await saveTimerToDatabase(title, duration);
    } catch (error) {
      console.error('Error saving timer:', error);
      throw error;
    }
  }

  /**
   * Load all completed timers from the database
   */
  async loadTimers(): Promise<CompletedTimer[]> {
    try {
      const timers = await loadTimersFromDatabase();
      // Sort by completion time (most recent first)
      return timers.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    } catch (error) {
      console.error('Error loading timers:', error);
      return [];
    }
  }

  /**
   * Get memory fallback data
   */
  getMemoryFallbackData(): CompletedTimer[] {
    return getMemoryFallbackData();
  }

  /**
   * Clear memory fallback data
   */
  clearMemoryFallback(): void {
    clearMemoryFallback();
  }

  /**
   * Reset database state
   */
  resetDatabaseState(): void {
    resetDatabaseState();
  }
}

// Export singleton instance
export const databaseService = new DatabaseServiceImpl();