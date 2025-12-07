import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

/**
 * Verifica se o usuário e senha correspondem a um usuário válido no banco.
 * Se válido, salva o uid no AsyncStorage.
 *
 * @param {string} email - email de usuário.
 * @param {string} password - Senha.
 * @returns {string} - UID do usuário autenticado.
 */
async function loginUser(email, password) {
    try {
        // 1. Autenticação
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        if (error.code === "auth/invalid-credential") {
            throw new Error("Usuário ou senha incorretos!");
        }

        if (error.code === "auth/user-not-found") {
            throw new Error("Usuário não encontrado!");
        }

        if (error.code === "auth/wrong-password") {
            throw new Error("Senha incorreta!");
        }

        console.error("Erro ao fazer login:", error);
        throw new Error("Erro ao fazer login. Tente novamente.");
    }
}

export default loginUser;
