import { View } from "react-native";

import { useEffect, useState } from "react";
import WelcomeOnboardingModal from "../../utils/WelcomeOnboardingModal";

import { useAppColors } from "@/hooks/use-app-colors";
import { useLocalSearchParams } from "expo-router";

export default function HomeScreen() {
    const COLORS = useAppColors();
    const { justRegistered } = useLocalSearchParams();
    const [welcomeVisible, setWelcomeVisible] = useState(false);

    useEffect(() => {
        if (justRegistered === "true") {
            setWelcomeVisible(true);
        }
    }, [justRegistered]);

    return (
        // <ParallaxScrollView
        //     headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        //     headerImage={
        //         <Image
        //             source={require("@/assets/images/partial-react-logo.png")}
        //             style={styles.reactLogo}
        //         />
        //     }
        // >
        //     <ThemedView style={styles.titleContainer}>
        //         <ThemedText type="title">Welcome!</ThemedText>
        //         <HelloWave />
        //     </ThemedView>
        // </ParallaxScrollView>

        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            {/* 
              Conteúdo da Home virá aqui futuramente 
              (dashboard, resumo financeiro, etc.)
            */}
            <WelcomeOnboardingModal
                visible={welcomeVisible}
                onFinish={() => setWelcomeVisible(false)}
            />
        </View>
    );
}
