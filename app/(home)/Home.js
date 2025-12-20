import { Inter_600SemiBold_Italic, useFonts } from "@expo-google-fonts/inter";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { auth } from "../../lib/firebase";
import styles from "../../styles/loginStyles";
import ModernButton from "../../utils/ModernButton";

export default function Home() {
    const [checking, setChecking] = useState(false);

    const [fontsLoaded] = useFonts({ Inter_600SemiBold_Italic });

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

    if (!fontsLoaded) {
        return (
            <LinearGradient
                colors={["#1F51FF", "#000080", "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ActivityIndicator size="large" />
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={["#1F51FF", "#000080", "#6D28D9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {checking && (
                <View style={{ position: "absolute", top: "50%", left: "50%" }}>
                    <ActivityIndicator size="large" />
                </View>
            )}

            <View style={styles.container1}>
                <Text style={styles.homeText}>My</Text>
                <Text style={styles.homeText}>Finances</Text>
            </View>

            <View style={{ width: "60%", marginTop: 80 }}>
                <ModernButton
                    text="Entrar"
                    onPress={() => keepSession()}
                    icon="sign-in-alt"
                    colors={["#1F51FF", "#4F46E5"]}
                />
            </View>
        </LinearGradient>
    );
}
