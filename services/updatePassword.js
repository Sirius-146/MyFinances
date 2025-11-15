import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Alert } from "react-native";

export async function updatePassword(
    userId,
    password,
    newPassword,
    confirmPassword,
    onPasswordError,
    onNewPasswordError,
    onConfirmPasswordError
) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    const userData = userSnap.data();
    const passwordBD = userData.password;
    
    if(!password){
        onPasswordError('Digite sua senha atual para alterar a senha');
        return false;
    }
    if (password !== passwordBD){
        onPasswordError('Senha Incorreta');
        return false;
    }
    if (newPassword.length < 6){
        onNewPasswordError('A senha deve ter pelo menos 6 caracteres')
        return false;
    }
    if (newPassword !== confirmPassword) {
        onConfirmPasswordError('Os valores não coincidem');
        return false;
    }
    
    try {
        await updateDoc(doc(db, 'users', userId), {password: newPassword});
        Alert.alert('Sucesso', 'Senha Atualizada');
        return true;
    } catch (error) {
        Alert.alert('Erro', 'Não foi possível atualizar a senha.');
        return false;
    }
}