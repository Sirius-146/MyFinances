import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
    User,
} from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { Alert } from "react-native";
import { db } from "../lib/firebase";
import { wipeExpensesLocal } from "./localExpensesService";

export interface DeleteUserParams {
    user: User | null;
    confirmPassword: string;
    setDeleting: (value: boolean) => void;
    setDeleteError: (value: string) => void;
    setShowDeleteModal: (value: boolean) => void;
    setConfirmPassword: (value: string) => void;
}
/**
 * Exclui conta do usuário de forma sequencial e limpa AsyncStorage
 * - Reautentica
 * - Exclui conta no Firebase Auth
 * - Exclui documento no Firestore
 * - Remove chaves locais do AsyncStorage (apenas se Auth foi excluído)
 *
 * @param {string} params.user - usuário da sessão atual
 * @param {string} params.confirmPassword - senha atual para reautenticar
 * @param {Function} params.setDeleting - setState boolean
 * @param {Function} params.setDeleteError - setState string
 * @param {Function} params.setShowDeleteModal - setState boolean
 * @param {Function} params.setConfirmPassword - setState string
 */
export async function deleteUserAccount({
    user,
    confirmPassword,
    setDeleting,
    setDeleteError,
    setShowDeleteModal,
    setConfirmPassword,
}: DeleteUserParams): Promise<boolean | void> {
    if (!user) {
        Alert.alert("Erro", "Usuário não autenticado");
        return;
    }

    if (!confirmPassword) {
        Alert.alert("Erro", "Digite sua senha para continuar.");
        return;
    }

    try {
        setDeleting(true);
        setDeleteError("");

        // Reautenticar
        const credential = EmailAuthProvider.credential(
            user.email!,
            confirmPassword
        );
        await reauthenticateWithCredential(user, credential);

        // Exclui conta (Login Auth)
        await deleteUser(user);

        // Exclui dados no Firestore
        if (user.uid) {
            const userRef = doc(db, "users", user.uid);
            await deleteDoc(userRef);
        }

        try {
            await wipeExpensesLocal(user.uid);
        } catch (err) {
            console.log("Erro ao apagar despesas locais", err);
        }

        // Limpa local e redireciona
        try {
            await AsyncStorage.removeItem("user");
        } catch (_) {}

        Alert.alert("Sucesso", "Sua conta foi excluída com sucesso!");
        setShowDeleteModal(false);
        setConfirmPassword("");

        router.replace("/login");
        setDeleting(false);
        return true;
    } catch (error: any) {
        console.log("Erro ao excluir conta:", error);
        const message =
            error?.code === "auth/requires-recent-login"
                ? "Reautentique e tente novamente."
                : "Não foi possível excluir a conta. Tente novamente mais tarde.";

        setDeleteError(message);
        Alert.alert("Erro", message);
        setDeleting(false);
        return false;
    }
}
