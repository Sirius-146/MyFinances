import { StyleSheet } from "react-native";
import { COLORS } from "./default";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    homeText: {
        fontFamily: "Inter_600SemiBold_Italic",
        fontSize: 60,
        color: COLORS.primary,
        textAlign: "center",
        letterSpacing: 1,
    },
});

export default styles;
