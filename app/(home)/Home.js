import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../../styles/HomeStyles";
import ModernButton from "../../utils/ModernButton";
import { router } from "expo-router";

export default function Home(){
    async function keepSession(){
        const user = await AsyncStorage.getItem('user')
        const password = await AsyncStorage.getItem('password')

        if (user && password){
            router.replace('/(tabs)');
        }else{
            router.replace('/login');
        }
    }

    return(
        <View style={styles.container}>
            <View style={styles.container1}>
                <Text style={styles.homeText}>My</Text>
                <Text style={styles.homeText}>Finances</Text>
            </View>
            <ModernButton
                text="Entrar"
                onPress={() => keepSession()}
                icon="sign-in-alt"
            /> 
        </View>
    )

}
