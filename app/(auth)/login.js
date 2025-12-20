import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import RegisterModal from "../../components/registerModal";
import loginUser from "../../services/loginUser";
import { COLORS } from "../../styles/default";
import styles from "../../styles/loginStyles";
import AlertPopup from "../../utils/AlertPopup";
import ModernButton from "../../utils/ModernButton";
import ModernInput from "../../utils/ModernInput";
import PasswordField from "../../utils/Passwordfield";

export default function Login() {
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    function handleAuthSuccess(payload = {}) {
        router.replace({
            pathname: "/(tabs)",
            params: { ...payload },
        });
    }

    async function handleLogin() {
        if (!email || !password) {
            setAlertMessage("Preencha todos os campos.");
            setAlertVisible(true);
            return;
        }

        try {
            setLoadingVisible(true);

            await loginUser(email, password);
            handleAuthSuccess();
        } catch (error) {
            setAlertMessage(error?.message || "Erro ao realizar login.");
            setAlertVisible(true);
        } finally {
            setLoadingVisible(false);
        }
    }

    return (
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
            <View style={styles.container1}>
                <Text style={styles.homeText}>My</Text>
                <Text style={styles.homeText}>Finances</Text>
            </View>

            <View
                style={{
                    alignItems: "center",
                    marginVertical: 30,
                    width: "100%",
                }}
            >
                <ModernInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    keyboardType={"email-address"}
                    autoCapitalize="none"
                    style={styles.inputLoginPassword}
                />
                <PasswordField
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Senha"
                    style={[styles.inputLoginPassword]}
                    placeholderColor={COLORS.secondary}
                />
            </View>
            <View style={styles.viewButtons}>
                <ModernButton
                    text="Login"
                    onPress={handleLogin}
                    colors={["#1F51FF", "#4F46E5"]}
                    icon="sign-in-alt"
                />
                <ModernButton
                    text="Criar Conta"
                    onPress={() => setModalVisible(true)}
                    icon="user-plus"
                    colors={["transparent", "transparent"]}
                    style={styles.stylebutton}
                />
            </View>

            <View>
                <RegisterModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSuccess={handleAuthSuccess}
                    onError={(message) => {
                        setAlertMessage(message);
                        setAlertVisible(true);
                    }}
                    styles={styles}
                />
            </View>

            <AlertPopup
                visible={alertVisible}
                message={alertMessage}
                onClose={() => setAlertVisible(false)}
            />
        </LinearGradient>
    );
}
