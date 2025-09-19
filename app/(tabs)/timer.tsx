import {Text, View, StyleSheet} from 'react-native';
import CustomTimer from '@/components/timer';
import Playlist from '@/components/playlist';

export default function Timer(){
    return(
        <View style={styles.container}>
            <CustomTimer/>
            <Playlist/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
        paddingTop: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    }
});