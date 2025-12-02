import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

function isEmailValid(email) {
  return /\S+@\S+\.\S+/.test(email);
}

/**
 * Criação segura de usuários utilizando Firebase Auth.
 * Agora o 'user' é apenas um nome e pode repetir.
 *
 * @param {string} user - Nome do usuário (pode repetir).
 * @param {string} password - Senha.
 * @param {string} email - E-mail do usuário.
 * @returns {string} - Nome do usuário criado.
 * @throws {Error} - Em caso de email inválido ou email já registrado.
 */
async function createUserSafe(user, email, password) {
  if (!isEmailValid(email)) {
    throw new Error('Digite um e-mail válido!');
  }

  try {
    // 1. Criar o usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    // 2. Criar documento no Firestore (somente dados públicos)
    await setDoc(doc(db, 'users', uid), {
      name: user,
      createdAt: new Date().toISOString(),
    });

    return user;

  } catch (error) {

    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email já está cadastrado!');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('A senha deve conter pelo menos 6 caracteres!');
    }

    console.error("Erro ao criar usuário:", error);
    throw new Error('Erro ao criar usuário. Tente novamente.');
  }
}

export default createUserSafe;
