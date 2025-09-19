import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface DigitSelectorProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
}

/**
 * Reusable digit selector component for timer digits
 */
export const DigitSelector: React.FC<DigitSelectorProps> = ({
  value,
  onIncrement,
  onDecrement,
  disabled = false
}) => {
  return (
    <View style={styles.digitContainer}>
      <TouchableOpacity 
        onPress={onIncrement} 
        style={[styles.button, disabled && { opacity: 0 }]}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>

      <Text style={styles.digitText}>{value.toString()}</Text>

      <TouchableOpacity 
        onPress={onDecrement} 
        style={[styles.button, disabled && { opacity: 0 }]}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  digitContainer: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  digitText: {
    color: 'white',
    fontSize: 65,
    fontWeight: 'bold',
    marginVertical: 0,
  },
});