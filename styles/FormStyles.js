import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: 12,
        marginTop: 20,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        padding: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },

    card: {
        padding: 16,
        borderRadius: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 16,
    },
    label: {
        marginTop: 12,
        marginBottom: 6,
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        marginBottom: 6,
    },
    multiline: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    error: {
        color: "#E53935",
        fontSize: 12,
        marginBottom: 6,
    },
});

export default styles;
