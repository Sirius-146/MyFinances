import { auth } from "@/lib/firebase";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";

export async function getUser(setUserId) {
    const unsubscribe = onAuthStateChanged(auth, (user) =>{
        if(!user){
            router.replace('/');
        }else{
            setUserId(user.uid);
        }
    });

    return unsubscribe;
};