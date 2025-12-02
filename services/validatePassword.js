import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { Alert } from "react-native";
import { auth } from "../lib/firebase";

export async function validatePassword(
    password,
    newPassword,
    confirmPassword,
    onPasswordError,
    onNewPasswordError,
    onConfirmPasswordError
) {
    const user = auth.currentUser;

    if(!user) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return false;
    }
    
    if(!password){
        onPasswordError('Digite sua senha atual');
        return false;
    }
    if (newPassword.length < 6){
        onNewPasswordError('A senha deve ter pelo menos 6 caracteres')
        return false;
    }
    if (newPassword !== confirmPassword) {
        onConfirmPasswordError('As senhas não coincidem');
        return false;
    }
    
    try {
        const credential = EmailAuthProvider.credential(
            user.email,
            password
        );

        await reauthenticateWithCredential(user, credential);
    } catch (error) {
        console.log(error);
        onPasswordError('Senha atual incorreta.');
        return false;
    }

    try {
        await updatePassword(user, newPassword);
        Alert.alert('Sucesso', 'Senha Atualizada');
        return true;
    } catch (error) {
        console.log('Erro ao atualizar senha:', error);
        Alert.alert('Erro', 'Não foi possível atualizar a senha.');
        return false;
    }
}