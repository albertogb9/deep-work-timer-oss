import {Tabs} from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function TabLayout(){
    return(
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: '#0f0f0f',
                borderTopColor: '#333',
                borderTopWidth: 0,
            },
            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: '#666',
        }}>
            <Tabs.Screen 
                name="timer" 
                options={{
                    title: 'Timer',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="timer-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen 
                name="activity" 
                options={{
                    title: 'Activity',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}