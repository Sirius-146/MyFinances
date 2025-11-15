import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export async function getUser(setUserId) {
    try{
        const user = await AsyncStorage.getItem('user');
        if(!user){
            router.replace('/');
        }else{
            setUserId(user);
        }
    }catch (error) {
        console.log('Erro na função getUser: ', error)
    }
};