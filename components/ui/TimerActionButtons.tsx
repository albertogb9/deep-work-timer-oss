import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface TimerActionButtonsProps {
  isRunning: boolean;
  isPaused: boolean;
  totalTimeInSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onEnd: () => void;
  onReset: () => void;
}

/**
 * Timer control buttons component
 * Handles start, pause, end, and reset actions
 */
export const TimerActionButtons: React.FC<TimerActionButtonsProps> = ({
  isRunning,
  isPaused,
  totalTimeInSeconds,
  onStart,
  onPause,
  onEnd,
  onReset
}) => {
  const isDisabled = totalTimeInSeconds === 0;

  return (
    <View style={styles.controlButtons}>
      {/* Start/Resume/Pause Button */}
      {!isRunning ? (
        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.activeButton,
            isDisabled && styles.disabledButton
          ]}
          onPress={onStart}
          disabled={isDisabled}
        >
          <Ionicons 
            name={isPaused ? "arrow-forward" : "play"}
            color="white" 
            size={24} 
          />
          <Text style={[
            styles.controlButtonText,
            isDisabled && styles.disabledButtonText
          ]}>
            {isPaused ? 'Resume' : 'Start'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.controlButton, styles.activeButton]}
          onPress={onPause}
        >
          <Ionicons 
            name="pause" 
            color="white"
            size={24} 
          />
          <Text style={styles.controlButtonText}>
            Pause
          </Text>
        </TouchableOpacity>            
      )}

      {/* End button - only show when running or paused */}
      {(isRunning || isPaused) && (
        <TouchableOpacity
          style={[styles.controlButton, styles.activeButton]}
          onPress={onEnd}
        >
          <Ionicons 
            name="stop"
            color="white" 
            size={24} 
          />
          <Text style={styles.controlButtonText}>
            End
          </Text>
        </TouchableOpacity>
      )}

      {/* Reset button - only show when not running and not paused */}
      {!isRunning && !isPaused && (
        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.activeButton,
            isDisabled && styles.disabledButton
          ]}
          onPress={onReset}
          disabled={isDisabled}
        >
          <Ionicons 
            name="refresh"
            color="white" 
            size={24} 
          />
          <Text style={[
            styles.controlButtonText,
            isDisabled && styles.disabledButtonText
          ]}>            
            Reset
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  controlButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  controlButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    width: 130,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    minWidth: 80,
  },
  activeButton: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: 'white',
  },
  disabledButton: {
    backgroundColor: '#808080',
    borderWidth: 1,
    borderColor: '#666',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: 'white',
  },
});