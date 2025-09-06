import {Stack} from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout(){
    return(
        <>
            <StatusBar style="light" backgroundColor="#0f0f0f" />
            <Stack>
                <Stack.Screen name="(tabs)" options={{headerShown:false}}/>
            </Stack>
        </>
    );
}