import {
    ActivityIndicator,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import PasswordField from "../../../utils/Passwordfield";
import styles from "../styles/styles";

const PasswordConfirmationModal = ({
    visible,
    password,
    onChangePassword,
    onCancel,
    onConfirm,
    loading,
    errorMessage,
}) => {
    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
                    <Text style={styles.modalText}>
                        Digite sua senha para confirmar:
                    </Text>

                    <PasswordField
                        value={password}
                        onChangeText={onChangePassword}
                        placeholder="Senha"
                        secureTextEntry={true}
                        style={[errorMessage ? { borderColor: "#e53935" } : {}]}
                        placeholderTextColor="#666"
                    />

                    {errorMessage ? (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    ) : null}

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onCancel}
                            disabled={loading}
                        >
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.confirmText}>
                                    Confirmar
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default PasswordConfirmationModal;
