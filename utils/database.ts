import * as SQLite from 'expo-sqlite';
import { Alert } from 'react-native';

export interface CompletedTimer {
  id: number;
  title: string;
  duration: number;
  completed_at: string;
}

// Global database state management
let dbInstance: any = null;
let dbCorrupted = false;
let memoryFallback: CompletedTimer[] = [];
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

export const resetDatabaseState = () => {
  dbInstance = null;
  dbCorrupted = false;
  connectionAttempts = 0;
  console.log('Database state reset');
};

const isDatabaseHealthy = async (db: any): Promise<boolean> => {
  try {
    // Simple health check query
    if (db.getFirstAsync) {
      await db.getFirstAsync('SELECT 1 as test');
    } else {
      await new Promise((resolve, reject) => {
        db.transaction(
          (tx: any) => tx.executeSql('SELECT 1 as test', [], resolve, reject),
          reject,
          resolve
        );
      });
    }
    return true;
  } catch (error) {
    console.warn('Database health check failed:', error);
    return false;
  }
};

const getHealthyDatabase = async (): Promise<any> => {
  // If we already have a healthy instance, use it
  if (dbInstance && !dbCorrupted) {
    const isHealthy = await isDatabaseHealthy(dbInstance);
    if (isHealthy) {
      return dbInstance;
    } else {
      console.warn('Existing database instance is unhealthy, resetting');
      dbCorrupted = true;
      dbInstance = null;
    }
  }

  // Try to create a new healthy connection
  connectionAttempts++;
  if (connectionAttempts > MAX_CONNECTION_ATTEMPTS) {
    console.error('Max connection attempts reached, using memory fallback');
    throw new Error('Database permanently unavailable');
  }

  try {
    let newDb = null;
    
    // Try modern API first
    try {
      newDb = await SQLite.openDatabaseAsync('timers.db');
      console.log(`Database opened successfully (attempt ${connectionAttempts})`);
    } catch (modernError) {
      console.warn('Modern API failed, trying legacy:', modernError);
      newDb = SQLite.openDatabaseSync('timers.db');
      console.log('Database opened with legacy API');
    }

    // Health check the new connection
    const isHealthy = await isDatabaseHealthy(newDb);
    if (!isHealthy) {
      throw new Error('New database connection failed health check');
    }

    // Reset state on successful connection
    dbInstance = newDb;
    dbCorrupted = false;
    connectionAttempts = 0;
    
    return dbInstance;
  } catch (error) {
    console.error(`Database connection attempt ${connectionAttempts} failed:`, error);
    throw error;
  }
};

const saveToMemoryFallback = (title: string, duration: number): number => {
  const timer: CompletedTimer = {
    id: Date.now(),
    title: title.trim(),
    duration: Math.floor(duration),
    completed_at: new Date().toISOString()
  };
  memoryFallback.push(timer);
  console.log('Timer saved to memory fallback:', timer.id);
  return timer.id;
};

export const saveTimerToDatabase = async (title: string, duration: number): Promise<number | undefined> => {
  try {
    // Validate inputs
    if (!title || typeof title !== 'string' || title.trim() === '') {
      console.warn('Invalid title provided, using default');
      title = 'Deep Work Session';
    }
    if (!duration || typeof duration !== 'number' || duration <= 0) {
      console.warn('Invalid duration provided, skipping save');
      return;
    }

    console.log('Attempting to save timer:', { title: title.trim(), duration: Math.floor(duration) });

    try {
      // Get a healthy database connection
      const db = await getHealthyDatabase();

      // Create table with enhanced error detection
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS completed_timers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          duration INTEGER NOT NULL,
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;

      try {
        if (db.execAsync) {
          await db.execAsync(createTableQuery);
        } else {
          await new Promise((resolve, reject) => {
            db.transaction(
              (tx: any) => tx.executeSql(createTableQuery, [], resolve, reject),
              reject,
              resolve
            );
          });
        }
        console.log('Table created/verified successfully');
      } catch (tableError) {
        console.error('Table creation failed:', tableError);
        // Mark database as corrupted and try memory fallback
        dbCorrupted = true;
        throw tableError;
      }

      // Insert data with corruption detection
      const insertQuery = 'INSERT INTO completed_timers (title, duration) VALUES (?, ?)';
      const params = [title.trim(), Math.floor(duration)];

      try {
        if (db.runAsync) {
          const result = await db.runAsync(insertQuery, params);
          console.log('Timer saved successfully (modern API):', result.lastInsertRowId);
          return result.lastInsertRowId;
        } else {
          const result: any = await new Promise((resolve, reject) => {
            db.transaction(
              (tx: any) => {
                tx.executeSql(insertQuery, params, (_: any, result: any) => {
                  console.log('Timer saved successfully (legacy API):', result.insertId);
                  resolve(result);
                }, reject);
              },
              reject,
              resolve
            );
          });
          return result.insertId;
        }
      } catch (insertError) {
        console.error('Insert operation failed:', insertError);
        // Mark database as corrupted
        dbCorrupted = true;
        throw insertError;
      }

    } catch (dbError) {
      console.error('Database operation failed, trying memory fallback:', dbError);
      
      // Use memory fallback
      const fallbackId = saveToMemoryFallback(title, duration);
      
      // Show user-friendly message about fallback
      Alert.alert(
        'Timer Saved',
        'Timer completed successfully! Data temporarily stored in memory.',
        [{ text: 'OK' }]
      );
      
      return fallbackId;
    }
    
  } catch (error) {
    console.error('Complete save operation failed:', error);
    
    // Last resort: memory fallback
    try {
      const fallbackId = saveToMemoryFallback(title, duration);
      Alert.alert(
        'Timer Completed',
        'Timer finished successfully! Session data stored temporarily.',
        [{ text: 'OK' }]
      );
      return fallbackId;
    } catch (fallbackError) {
      console.error('Even memory fallback failed:', fallbackError);
      Alert.alert(
        'Timer Completed',
        'Timer finished successfully! Unable to save session data.',
        [{ text: 'OK' }]
      );
    }
  }
};

export const loadTimersFromDatabase = async (): Promise<CompletedTimer[]> => {
  try {
    console.log('Attempting to load timers from database');
    
    let timers: CompletedTimer[] = [];
    
    try {
      // Get a healthy database connection
      const db = await getHealthyDatabase();

      // Create table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS completed_timers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          duration INTEGER NOT NULL,
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;

      try {
        if (db.execAsync) {
          await db.execAsync(createTableQuery);
        } else {
          await new Promise((resolve, reject) => {
            db.transaction(
              (tx: any) => tx.executeSql(createTableQuery, [], resolve, reject),
              reject,
              resolve
            );
          });
        }
        console.log('Table verified for loading');
      } catch (tableError) {
        console.error('Table verification failed:', tableError);
        dbCorrupted = true;
        throw tableError;
      }

      // Fetch all timers with fallback methods
      const selectQuery = 'SELECT * FROM completed_timers ORDER BY completed_at DESC';

      try {
        if (db.getAllAsync) {
          timers = await db.getAllAsync(selectQuery) as CompletedTimer[];
          console.log(`Loaded ${timers.length} timers (modern API)`);
        } else {
          timers = await new Promise((resolve, reject) => {
            db.transaction(
              (tx: any) => {
                tx.executeSql(selectQuery, [], (_: any, { rows }: any) => {
                  const result = [];
                  for (let i = 0; i < rows.length; i++) {
                    result.push(rows.item(i));
                  }
                  console.log(`Loaded ${result.length} timers (legacy API)`);
                  resolve(result);
                }, reject);
              },
              reject
            );
          }) as CompletedTimer[];
        }
      } catch (selectError) {
        console.error('Select operation failed:', selectError);
        dbCorrupted = true;
        throw selectError;
      }

    } catch (dbError) {
      console.error('Database operation failed during loading, using memory fallback:', dbError);
      
      // Return memory fallback data
      console.log(`Using memory fallback: ${memoryFallback.length} timers`);
      timers = [...memoryFallback].sort((a, b) => 
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      );
    }
    
    // Combine database and memory data
    const allTimers = [...timers, ...memoryFallback];
    const uniqueTimers = allTimers.filter((timer, index, self) => 
      index === self.findIndex(t => t.id === timer.id)
    ).sort((a, b) => 
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );
    
    console.log(`Returning ${uniqueTimers.length} total timers (${timers.length} from DB, ${memoryFallback.length} from memory)`);
    return uniqueTimers;
    
  } catch (error) {
    console.error('Error loading timers from database:', error);
    
    // Return memory fallback as last resort
    console.log(`Fallback to memory only: ${memoryFallback.length} timers`);
    return [...memoryFallback].sort((a, b) => 
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );
  }
};

export const getMemoryFallbackData = (): CompletedTimer[] => {
  return [...memoryFallback];
};

export const clearMemoryFallback = (): void => {
  memoryFallback = [];
  console.log('Memory fallback cleared');
};