import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface EditableTitleProps {
  title: string;
  isEditing: boolean;
  isDisabled: boolean;
  onTitleChange: (title: string) => void;
  onStartEditing: () => void;
  onStopEditing: () => void;
}

/**
 * Editable title component for timer
 * Allows users to edit the timer title when not running
 */
export const EditableTitle: React.FC<EditableTitleProps> = ({
  title,
  isEditing,
  isDisabled,
  onTitleChange,
  onStartEditing,
  onStopEditing
}) => {
  return (
    <View style={styles.titleContainer}>
      {isEditing ? (
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={onTitleChange}
          onBlur={onStopEditing}
          onSubmitEditing={onStopEditing}
          autoFocus
          selectTextOnFocus
          maxLength={30}
        />
      ) : (
        <TouchableOpacity 
          onPress={onStartEditing}
          disabled={isDisabled}
          style={styles.titleTouchable}
        >
          <Text style={[styles.titleText, isDisabled && styles.titleDisabled]}>
            {title}
          </Text>
          {!isDisabled && (
            <Ionicons 
              name="pencil" 
              size={20} 
              color="#8b949e" 
              style={styles.editIcon}
            />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  titleTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  editIcon: {
    marginLeft: 4,
  },
  titleDisabled: {
    opacity: 0.6,
  },
  titleInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 200,
  },
});