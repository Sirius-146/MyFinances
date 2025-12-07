import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Verifica se o usuário e senha correspondem a um usuário válido no banco.
 * Se válido, salva os dados no AsyncStorage e retorna o ID do usuário.
 *
 * @param {string} email - email de usuário.
 * @param {string} password - Senha.
 * @returns {string} - ID do usuário autenticado.
 */
async function logIn(email, password) {
    const snapshot = await getDocs(collection(db, "users"));

    const users = snapshot.docs.map((doc) => doc.data());
    const matchedUser = users.find(
        (item) => item.email === email && item.password === password
    );

    if (!matchedUser) {
        alert("Usuário ou senha incorretos!");
    }

    await AsyncStorage.setItem("user", matchedUser.id.toString());
    await AsyncStorage.setItem("password", password);
    return matchedUser.id.toString();
}

export default logIn;
