import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { auth } from "../../lib/firebase";
import styles from "../../styles/HomeStyles";
import ModernButton from "../../utils/ModernButton";

export default function Home() {
    const [checking, setChecking] = useState(false);

    async function keepSession() {
        setChecking(true);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setChecking(false);

            if (user) {
                router.replace("/(tabs)");
            } else {
                router.replace("/login");
            }
        });

        return unsubscribe;
    }

    return (
        <View style={styles.container}>
            {checking && (
                <View style={{ position: "absolute", top: "50%", left: "50%" }}>
                    <ActivityIndicator size="large" />
                </View>
            )}

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
    );
}
