import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
    },
    imageContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
    },
    image: {
        borderWidth: 1,
        height: 130,
        width: 130,
        borderRadius: 65,
        resizeMode: "cover",
    },
    label: {
        fontSize: 16,
        marginHorizontal: 5,
        marginVertical: 0,
        fontWeight: "bold",
    },
    inputProfile: {
        padding: 5,
        height: 40,
        marginHorizontal: 5,
        marginVertical: 5,
        borderWidth: 1,
        borderRadius: 8,
    },

    passwordContainer: {
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 12,
        paddingRight: 10,
        margin: 5,
        padding: Platform.OS === "android" ? 0 : 10,
        paddingHorizontal: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    inputPassword: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },

    footContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        marginBottom: 65,
    },

    loadingBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        elevation: 10,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalText: {
        fontSize: 14,
        marginBottom: 10,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cancelButton: {
        backgroundColor: "#ccc",
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginRight: 10,
        alignItems: "center",
    },
    confirmButton: {
        backgroundColor: "#e53935",
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginLeft: 10,
        alignItems: "center",
    },
    cancelText: {
        color: "#000",
        fontWeight: "bold",
    },
    confirmText: {
        color: "#fff",
        fontWeight: "bold",
    },
    errorText: {
        color: "#e53935",
        fontSize: 14,
        marginLeft: 5,
    },
    textUserName: {
        fontSize: 20,
        fontWeight: "bold",
        paddingVertical: 10,
    },
});

export default styles;
