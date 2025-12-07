import { useState } from "react";
import { View } from "react-native";
import { validatePassword } from "../../services/validatePassword";
import ModernButton from "../../utils/ModernButton";
import PasswordField from "../../utils/Passwordfield";
import styles from "./styles/styles";

import { router } from "expo-router";

export default function PasswordUpdate() {
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [passwordError, setPasswordError] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    async function handleUpdatePassword() {
        setPasswordError("");
        setNewPasswordError("");
        setConfirmPasswordError("");

        const success = await validatePassword(
            password,
            newPassword,
            confirmPassword,
            setPasswordError,
            setNewPasswordError,
            setConfirmPasswordError
        );

        if (success) {
            router.replace("/profile");
        }
    }

    return (
        <View style={styles.container}>
            <View style={{ marginTop: 10, marginHorizontal: 5 }}>
                <PasswordField
                    label={"Senha Atual"}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={"Senha Atual"}
                    errorMessage={passwordError}
                />
                <PasswordField
                    label={"Nova Senha"}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Nova Senha"
                    errorMessage={newPasswordError}
                />

                <PasswordField
                    label={"Confirmar Nova Senha"}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Digite a senha novamente"
                    errorMessage={confirmPasswordError}
                />
            </View>
            <View style={{ ...styles.footContainer, alignSelf: "center" }}>
                <ModernButton
                    text="Salvar Dados"
                    onPress={handleUpdatePassword}
                    icon="save"
                />
            </View>
        </View>
    );
}
