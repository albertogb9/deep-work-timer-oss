import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { useActivity } from '../../hooks';
import { CompletedTimer, DayActivity } from '../../types';

export default function Activity() {
  const {
    // State
    completedTimers,
    activityData,
    selectedDay,
    selectedDayTimers,
    
    // Actions
    loadTimers,
    selectDay,
    clearSelection,
  } = useActivity();

  // Activity data generation is now handled by the useActivity hook

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityColor = (count: number) => {
    if (count === 0) return '#1a1a1a';
    if (count <= 1) return '#0d4429';
    if (count <= 2) return '#166534';
    if (count <= 3) return '#22c55e';
    return '#4ade80';
  };

  const getActivityIntensity = (count: number) => {
    if (count === 0) return 0;
    if (count <= 5) return 1;
    if (count <= 15) return 2;
    if (count <= 25) return 3;
    return 4;
  }

  const renderTimerItem = ({ item }: { item: CompletedTimer }) => (
    <View style={styles.timerItem}>
      <View style={styles.timerHeader}>
        <Text style={styles.timerTitle}>{item.title}</Text>
        <Text style={styles.timerDuration}>{formatDuration(item.duration)}</Text>
      </View>
      <Text style={styles.timerDate}>{formatDate(item.completed_at)}</Text>
    </View>
  );

  const handleDayPress = (day: DayActivity) => {
    selectDay(day.month);
  };

  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthPositions = new Map();
    
    // Find the first day of each month in the activity data
    activityData.forEach((dayData, index) => {
      const date = new Date(dayData.month);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = months[date.getMonth()];
      
      if (!monthPositions.has(monthKey)) {
        // Calculate the column position (week number)
        const columnIndex = Math.floor(index / 7);
        monthPositions.set(monthKey, {
          month: monthName,
          position: columnIndex
        });
      }
    });
    
    return Array.from(monthPositions.values());
  };

  const renderActivityGrid = () => {
    const columns = [];
    const monthLabels = getMonthLabels();
    
    for (let i = 0; i < 52; i++) {
      const column = [];
      for (let j = 0; j < 7; j++) {
        const dayIndex = i * 7 + j;
        if (dayIndex < activityData.length) {
          column.push(activityData[dayIndex]);
        }
      }
      if (column.length > 0) {
        columns.push(column);
      }
    }

    return (
      <View>
        <View style={styles.activityGrid}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Month labels */}
              <View style={styles.monthLabelsContainer}>
                {monthLabels.map((label, index) => (
                  <Text key={index} style={[styles.monthLabel, { left: label.position * 24 }]}>
                    {label.month}
                  </Text>
                ))}
              </View>
              
              {/* Activity grid */}
              <View style={styles.gridContainer}>
                {columns.map((column, columnIndex) => (
                  <View key={columnIndex} style={styles.dayColumn}>
                    {column.map((day, dayIndex) => (
                      <TouchableOpacity
                        key={`${day.month}-${columnIndex}-${dayIndex}`}
                        style={[
                          styles.daySquare,
                          { backgroundColor: getActivityColor(day.count) },
                          selectedDay === day.month && styles.selectedDaySquare
                        ]}
                        onPress={() => handleDayPress(day)}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
        
        {/* Legend outside scroll view */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendText}>Less</Text>
          <View style={styles.legendSquares}>
            <View style={[styles.legendSquare, { backgroundColor: '#1a1a1a' }]} />
            <View style={[styles.legendSquare, { backgroundColor: '#0d4429' }]} />
            <View style={[styles.legendSquare, { backgroundColor: '#166534' }]} />
            <View style={[styles.legendSquare, { backgroundColor: '#22c55e' }]} />
            <View style={[styles.legendSquare, { backgroundColor: '#4ade80' }]} />
          </View>
          <Text style={styles.legendText}>More</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderActivityGrid()}
        
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>
            {selectedDay ? `Sessions for ${new Date(selectedDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Recent Sessions'}
          </Text>
          {selectedDay && (
            <TouchableOpacity 
              style={styles.clearSelectionButton}
              onPress={clearSelection}
            >
              <Text style={styles.clearSelectionText}>Show All Sessions</Text>
            </TouchableOpacity>
          )}
          {(selectedDay ? selectedDayTimers : completedTimers).length > 0 ? (
            <FlatList
              data={selectedDay ? selectedDayTimers : completedTimers}
              renderItem={renderTimerItem}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyMessage}>
              {selectedDay ? 'No sessions on this day' : 'No completed sessions yet'}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  scrollView: {
    flex: 1,
    padding:20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  activityGrid: {
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'flex-start',
  },
  dayColumn: {
    flexDirection: 'column',
    gap: 4,
  },
  daySquare: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
  selectedDaySquare: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  monthLabelsContainer: {
    flexDirection: 'row',
    height: 20,
    marginBottom: 8,
    position: 'relative',
  },
  monthLabel: {
    fontSize: 12,
    color: '#8b949e',
    position: 'absolute',
    top: 0,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#8b949e',
  },
  legendSquares: {
    flexDirection: 'row',
    gap: 3,
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  clearSelectionButton: {
    backgroundColor: '#21262d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  clearSelectionText: {
    color: '#58a6ff',
    fontSize: 14,
    fontWeight: '500',
  },
   historySection: {
    flex: 1,
  },
  timerItem: {
    backgroundColor: '#21262d',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#39d353',
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  timerDuration: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#39d353',
  },
  timerDate: {
    fontSize: 14,
    color: '#8b949e',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#8b949e',
    textAlign: 'center',
    marginTop: 40,
  },
});