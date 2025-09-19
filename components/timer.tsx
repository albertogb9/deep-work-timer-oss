import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useTimer } from '../hooks';
import { DigitSelector, TimerActionButtons, EditableTitle } from './ui';
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function CustomTimer() {
    // Use the custom timer hook for all business logic
    const {
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
        endTimer,
        resetTimer,
        setTimerTitle,
        setIsEditingTitle,
        
        // Utils
        getTotalTimeInSeconds,
        getProgress,
    } = useTimer();

    // All timer logic is now handled by the useTimer hook



    // All timer business logic is now handled by the useTimer hook

    // Components are now imported from the ui folder

    return (
        <View style={styles.timerContainer}>
            {/* Editable Title Component */}
            <EditableTitle
                title={timerTitle}
                isEditing={isEditingTitle}
                isDisabled={isRunning || isPaused}
                onTitleChange={setTimerTitle}
                onStartEditing={() => setIsEditingTitle(true)}
                onStopEditing={() => setIsEditingTitle(false)}
            />

            {/* Animated Progress Circle with Timer Digits */}
            <AnimatedCircularProgress
                style={styles.circle}
                width={20}
                size={350}
                fill={getProgress()}
                tintColor="white"
                backgroundColor="#333333"
                rotation={0}
                duration={1000}
            >
                {(fill) => (
                    <View style={styles.timeSelector}>
                        <DigitSelector 
                            value={minutesTens} 
                            onIncrement={incrementMinutesTens} 
                            onDecrement={decrementMinutesTens}
                            disabled={isRunning || isPaused}
                        />
                        <DigitSelector 
                            value={minutesUnits} 
                            onIncrement={incrementMinutesUnits} 
                            onDecrement={decrementMinutesUnits}
                            disabled={isRunning || isPaused}
                        />
                        <Text style={styles.colon}>:</Text>
                        <DigitSelector 
                            value={secondsTens} 
                            onIncrement={incrementSecondsTens} 
                            onDecrement={decrementSecondsTens}
                            disabled={isRunning || isPaused}
                        />
                        <DigitSelector 
                            value={secondsUnits} 
                            onIncrement={incrementSecondsUnits} 
                            onDecrement={decrementSecondsUnits}
                            disabled={isRunning || isPaused}
                        />
                    </View>
                )}
            </AnimatedCircularProgress>

            {/* Timer Control Buttons */}
            <View style={styles.buttonsContainer}>
                <TimerActionButtons
                    isRunning={isRunning}
                    isPaused={isPaused}
                    totalTimeInSeconds={getTotalTimeInSeconds()}
                    onStart={startTimer}
                    onPause={pauseTimer}
                    onEnd={endTimer}
                    onReset={resetTimer}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    timerContainer: {
        padding: 20,
        marginBottom: 50,
        alignItems: 'center',
    },
    circle: {
        marginBottom: 30,
    },
    timeSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    colon: {
        color: '#f5f5dc',
        fontSize: 35,
        marginHorizontal: 5,
    },
    buttonsContainer: {
        flexDirection: 'row',
    },
});