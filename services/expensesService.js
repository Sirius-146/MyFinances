import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { nanoid } from "nanoid/non-secure";
import { db } from "../lib/firebase";

export async function createExpense(userId, data) {
  const id = data.id || nanoid();
  
  const ref = doc(db, "users", userId, "expenses", id);

  await setDoc(ref, {
        ...data,
        id,
        createdAt: data.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
    }, { merge: true });
    
    return id;
}

export async function updateExpense(userId, expenseId, data) {
  const ref = doc(db, "users", userId, "expenses", expenseId);

  await setDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  
  return true;
}

export async function deleteExpense(userId, expenseId) {
  const ref = doc(db, "users", userId, "expenses", expenseId);
  await deleteDoc(ref);
  return true;
}

export async function getAllExpenses(userId) {
  const snapshot = await getDocs(collection(db, "users", String(userId), "expenses"));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id, // sempre usar docId como id oficial
      ...data,
    };
  });
}