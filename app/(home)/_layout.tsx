import {
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";

export default function TabLayout() {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_600SemiBold,
        Inter_700Bold,
    });
    return (
        <Stack>
            <Stack.Screen name="Home" options={{ headerShown: false }} />
        </Stack>
    );
}
