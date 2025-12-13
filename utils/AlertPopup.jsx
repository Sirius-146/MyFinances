// components/AlertPopup.jsx
import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AlertPopup({ visible, message, onClose }) {
    if (!visible) return null;

    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        accessibilityRole="button"
                        accessibilityLabel="Fechar alerta"
                    >
                        <Ionicons name="close" size={20} color="#999" />
                    </TouchableOpacity>

                    <Text style={styles.message}>{message}</Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        paddingTop: 28,
    },
    closeButton: {
        position: "absolute",
        top: 10,
        right: 10,
    },
    message: {
        fontSize: 15,
        color: "#444",
        textAlign: "center",
    },
});
