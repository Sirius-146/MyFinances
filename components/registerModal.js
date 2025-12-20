import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ActivityIndicator, Modal, View } from "react-native";
import createUser from "../services/createUser";
import { COLORS } from "../styles/default";
import ModernButton from "../utils/ModernButton";
import ModernInput from "../utils/ModernInput";
import PasswordField from "../utils/Passwordfield";

export default function RegisterModal({
    visible,
    onClose,
    onSuccess,
    onError,
    styles,
}) {
    const [user, setUser] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repPassword, setRepPassword] = useState("");
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [passwordError, setPasswordError] = useState(null);
    const [repSenhaError, setRepSenhaError] = useState(null);

    function resetFields() {
        setUser("");
        setEmail("");
        setPassword("");
        setRepPassword("");
    }

    async function handleRegister() {
        setPasswordError(null);
        setRepSenhaError(null);

        if (!user || !email || !password || !repPassword) {
            onError?.("Preencha todos os campos!");
            return;
        }
        if (password.length < 6) {
            setPasswordError("A senha deve ter pelo menos 6 caracteres");
            return;
        }
        if (password !== repPassword) {
            setRepSenhaError("As senhas não coincidem!");
            return;
        }

        try {
            setLoadingVisible(true);

            await createUser(user, email, password);

            onSuccess({ justRegistered: true });
            resetFields();
        } catch (error) {
            onError?.(error.message || "Erro ao criar usuário");
        } finally {
            setLoadingVisible(false);
        }
    }

    return (
        <Modal visible={visible} animationType="fade">
            <LinearGradient
                colors={["#1F51FF", "#000080", "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                {loadingVisible && (
                    <View style={styles.viewLoading}>
                        <ActivityIndicator size="large" />
                    </View>
                )}
                <View style={{ alignItems: "center", width: "100%" }}>
                    <ModernInput
                        value={user}
                        onChangeText={setUser}
                        placeholder="Digite seu nome"
                        style={styles.inputLoginPassword}
                    />
                    <ModernInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Digite o e-mail"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.inputLoginPassword}
                    />
                    <PasswordField
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Digite a senha"
                        style={[styles.inputLoginPassword]}
                        placeholderColor={COLORS.secondary}
                        errorMessage={passwordError}
                    />
                    <PasswordField
                        value={repPassword}
                        onChangeText={setRepPassword}
                        placeholder="Digite a senha novamente"
                        style={[styles.inputLoginPassword]}
                        placeholderColor={COLORS.secondary}
                        errorMessage={repSenhaError}
                    />
                </View>
                <View style={[styles.viewButtons, { marginTop: 30 }]}>
                    <ModernButton
                        text="Cadastrar"
                        onPress={handleRegister}
                        colors={["#1F51FF", "#4F46E5"]}
                    />
                    <ModernButton
                        text="Voltar"
                        onPress={() => {
                            resetFields();
                            onClose();
                        }}
                        icon="backspace"
                        colors={["transparent", "transparent"]}
                        style={styles.stylebutton}
                    />
                </View>
            </LinearGradient>
        </Modal>
    );
}
