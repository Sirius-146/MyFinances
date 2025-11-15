import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

function isEmailValid(email) {
  return /\S+@\S+\.\S+/.test(email);
}

/**
 * Módulo para driação de usuários.
 * @param {string} user - Nome de usuário.
 * @param {string} password - Senha.
 * @param {string} email - email.
 * @returns {string} - Nome do usuário autenticado.
 * @throws {Error} - Em caso de email inválido ou credenciais já em uso.
 */
async function createUser(user, password, email) {
  if (!isEmailValid(email)) {
    throw new Error('Digite um e-mail válido!');
  }

  const snapshot = await getDocs(collection(db, 'users'));
  const users = snapshot.docs.map(doc => doc.data());

  const usernameExists = users.some(u => u.name === user);
  const emailExists = users.some(u => u.email === email);

  if (usernameExists) {
    throw new Error('Usuário já existe!');
  }
  if (emailExists) {
    throw new Error('Email já utilizado!');
  }

  let maiorId = -1;
  snapshot.forEach((doc) =>{
    const data = doc.data();
    if (typeof data.id === 'number' && data.id > maiorId) {
      maiorId = data.id;
    }
  });

  const novoId = maiorId +1;

  await setDoc(doc(db, 'users', novoId.toString()), {id: novoId, name: user, password: password, email: email });
  return user;
}

export default createUser;