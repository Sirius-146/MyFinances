import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import RegisterModal from "../../components/registerModal";
import loginUser from "../../services/loginUser";
import styles from "../../styles/loginStyles";
import ModernButton from "../../utils/ModernButton";
import ModernInput from "../../utils/ModernInput";
import PasswordField from "../../utils/Passwordfield";

export default function Login() {
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(false);

    async function handleLogin() {
        if (!email || !password) {
            alert("Preencha todos os campos");
            return;
        }

        try {
            setLoadingVisible(true);

            await loginUser(email, password);
            setLoadingVisible(false);
            router.replace("/(tabs)");
        } catch (error) {
            setLoadingVisible(false);
            console.log(error);
        }
    }

    return (
        <View style={styles.container}>
            {loadingVisible && (
                <View style={styles.viewLoading}>
                    <ActivityIndicator size="large" />
                </View>
            )}
            <View style={styles.viewForm}>
                <View style={{ alignItems: "center" }}>
                    <ModernInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Digite o email"
                        keyboardType={"email-address"}
                    />
                    <PasswordField
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Digite a senha"
                        style={[styles.inputLoginPassword]}
                    />
                </View>
                <View style={styles.viewButtons}>
                    <ModernButton
                        text="Login"
                        onPress={handleLogin}
                        icon="sign-in-alt"
                    />
                    <ModernButton
                        text="Criar Conta"
                        onPress={() => setModalVisible(true)}
                        icon="user-plus"
                    />
                </View>
            </View>
            <View>
                <RegisterModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSuccess={() => router.replace("/(tabs)")}
                    styles={styles}
                />
            </View>
        </View>
    );
}
