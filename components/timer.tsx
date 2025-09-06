import {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Easing} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

export default function CustomTimer(){
    // States
    const [minutesTens, setMinutesTens] = useState(0);
    const [minutesUnits, setMinutesUnits] = useState(0);
    const [secondsTens, setSecondsTens] = useState(0);
    const [secondsUnits, setSecondsUnits] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [initialTime, setInitialTime] = useState(0);

    // Change timer digits
    const incrementMinutesTens = () => {
        setMinutesTens(prev => prev + 1);
    };

    const decrementMinutesTens = () => {
        setMinutesTens(prev => Math.max(0, prev - 1));
    };

    const incrementMinutesUnits = () => {
        setMinutesUnits(prev => {
            if (prev == 9){
                incrementMinutesTens();
                return 0;
            }
            return prev + 1;
        })
    };

    const decrementMinutesUnits = () => {
        setMinutesUnits(prev => {
            if (prev == 0 && minutesTens > 0){
                decrementMinutesTens();
                return 9;
                }
            return Math.max(0, prev - 1);
            })
    };

    const incrementSecondsTens = () => {
        setSecondsTens(prev => {
            if (prev == 5){
                incrementMinutesUnits();
                return 0;
            }
            return prev + 1;
        });
    };

    const decrementSecondsTens = () => {
        setSecondsTens(prev => {
            if (prev == 0 && (minutesTens > 0 || minutesUnits > 0)) {
                decrementMinutesUnits();
                return 5;
             } else {
                return Math.max(0, prev - 1);
            }
        });
    };

    const incrementSecondsUnits = () => {
        setSecondsUnits(prev => {
            if (prev == 9){                
                incrementSecondsTens();
                return 0;
            }
            return prev + 1;
        });
    }
    
    const decrementSecondsUnits = () => {
        setSecondsUnits(prev => {
            if (prev == 0 && ( minutesTens > 0 || minutesUnits > 0 || secondsTens > 0)) {
                decrementSecondsTens();
                return 9;
            } else {
                return Math.max(0, prev - 1);
            }
        })
    }

    // Change timer state
    const getTotalTimeInSeconds = () => {
        const totalMinutes = minutesTens * 10 + minutesUnits;
        const totalSeconds = secondsTens * 10 + secondsUnits;
        return (totalMinutes * 60 + totalSeconds);
    }
    const startTimer = () => {
        if (!isRunning && !isPaused) {
            const totalSeconds = getTotalTimeInSeconds();
            setTimeRemaining(totalSeconds);
            setInitialTime(totalSeconds);
        }
        setIsRunning(true);
        setIsPaused(false);        
    }

    const pauseTimer = () => {
        setIsPaused(true);
        setIsRunning(false);
    }

    const resetTimer = () => {
        setIsPaused(false);
        setIsRunning(false);
        setTimeRemaining(0);
        setMinutesTens(0);
        setMinutesUnits(0);
        setSecondsTens(0);
        setSecondsUnits(0);
    }

    const getProgress = () => {
        if (initialTime === 0) return 0;
        const elapsed = initialTime - timeRemaining+1;
        var elapsed_percentage = (elapsed / initialTime) * 100;
        if (elapsed_percentage > 100){
            elapsed_percentage = 0;
        }
        return elapsed_percentage;
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && timeRemaining > 0){
            interval = setInterval (() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        resetTimer();
                    }
                    decrementSecondsUnits();
                    return prev - 1;
                })
            }, 1000);
        }

        return () => {
            if (interval) clearInterval (interval);
        };
    }, [isRunning, timeRemaining])

    // Digit selector
    const DigitSelector = ({ value, onIncrement, onDecrement}) => (
        <View style={styles.digitContainer}>
            <TouchableOpacity onPress={onIncrement} style={[styles.button, (isRunning || isPaused) && {opacity: 0}]}>
                <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>

            <Text style={styles.digitText}>{value.toString()}</Text>

            <TouchableOpacity onPress={onDecrement} style={[styles.button, (isRunning || isPaused) && {opacity: 0}]}>
                <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
        </View>
    );

    // Timer action buttons
    const TimerActionButtons = () => (<View style={styles.controlButtons}>
        {/* Start/Resume/Pause Button */}
        {!isRunning ? (
            <TouchableOpacity
                style={[styles.controlButton, styles.startButton,
                    getTotalTimeInSeconds() === 0 && styles.disabledButton
                ]}
                onPress={startTimer}
                disabled={getTotalTimeInSeconds() === 0}>
                <Ionicons 
                    name={isPaused ? "arrow-forward" : "play"}
                    color={getTotalTimeInSeconds() === 0 ? "white" : "black"} 
                    size={24} 
                    />
                <Text style={[styles.controlButtonText,
                    getTotalTimeInSeconds() === 0 && styles.disabledButtonText
                ]}>
                    
                    {isPaused ? 'Resume' : 'Start'}
                </Text>
            </TouchableOpacity>
        ) : (
            <TouchableOpacity
                style={[styles.controlButton, styles.pauseButton]}
                onPress={pauseTimer}>
                <Ionicons 
                name={"pause"} 
                size={24} 
                />
                <Text style={styles.controlButtonText}>
                    
                    Pause
                </Text>
            </TouchableOpacity>            
        )}

        {/* Reset button */}
        <TouchableOpacity
            style={[styles.controlButton, styles.resetButton,
                getTotalTimeInSeconds() === 0 && styles.disabledButton
            ]}
            onPress={resetTimer}
            disabled={getTotalTimeInSeconds() === 0}>
            <Ionicons 
            name={"refresh"}
            color={getTotalTimeInSeconds() === 0 ? "white" : "black"} 
            size={24} 
            />
            <Text style={[styles.controlButtonText,
                getTotalTimeInSeconds() === 0 && styles.disabledButtonText
            ]}>            
            Reset</Text>
        </TouchableOpacity>

    </View>);

    // Final return
    return (
        <View style={styles.timerContainer}>
            <AnimatedCircularProgress
                style={styles.circle}
                width={10}
                size={250}
                fill={getProgress()}
                tintColor="white"
                backgroundColor="#333333"
                rotation={0}
                duration={1000}
                easing={Easing.linear}
            >
                {(fill) => (
                    <Text style={styles.circleText}>
                        Work
                    </Text>
                )}
            </AnimatedCircularProgress>
            <View style={styles.timeSelector}>
                <DigitSelector value={minutesTens} onIncrement={incrementMinutesTens} onDecrement={decrementMinutesTens} />
                <DigitSelector value={minutesUnits} onIncrement={incrementMinutesUnits} onDecrement={decrementMinutesUnits} />
                <Text style={styles.colon}>:</Text>
                <DigitSelector value={secondsTens} onIncrement={incrementSecondsTens} onDecrement={decrementSecondsTens} />
                <DigitSelector value={secondsUnits} onIncrement={incrementSecondsUnits} onDecrement={decrementSecondsUnits} />
            </View>

            <View style={styles.buttonsContainer}>
                <TimerActionButtons/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    timerContainer: {
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    circle: {
        marginBottom: 20,
    },
    circleText: {
        color: 'white',
        fontSize: 65,
        fontWeight: 'bold',       
    },
    timeSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,        
        
    },
    digitContainer: {
        alignItems: 'center',
        marginHorizontal: 4,
    
    },
    button: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',        
    },
    digitText: {
        color: 'white',
        fontSize: 65,
        fontWeight: 'bold',
        marginVertical: 0,
    },
    colon: {
        color: '#f5f5dc',
        fontSize: 48,
        marginHorizontal: 10,
    },
    buttonsContainer: {
        flexDirection: 'row',
    },
    controlButtons: {
        flexDirection: 'row',
        gap: 20,
    },
    controlButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        width: 130,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',

    },
    disabledButton: {
        backgroundColor: '#808080',
    },
    controlButtonText: {
        alignItems: 'center',
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButtonText: {
        color: 'white',
    },
    startButton: {
        backgroundColor: 'white',
    },
    pauseButton: {
        backgroundColor: 'white',
    },
    resetButton: {
        backgroundColor: 'white',
    },

});