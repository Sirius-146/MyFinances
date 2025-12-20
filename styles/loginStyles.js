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
    inputLoginPassword: {
        backgroundColor: "#ffffff1f",
        color: COLORS.secondary,
        width: "70%",
        borderWidth: 0,
        elevation: 0,
    },
    viewButtons: {
        width: "70%",
        justifyContent: "space-between",
        marginTop: 15,
    },

    viewLoading: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        backgroundColor: "#0000008a",
        justifyContent: "center",
        alignItems: "center",
    },

    stylebutton: {
        elevation: 0,
        borderWidth: 1,
        borderColor: "#1F51FF",
    },
});

export default styles;
