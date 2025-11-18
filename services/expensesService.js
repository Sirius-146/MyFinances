import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export async function createExpense(userId, data) {
    const ref = collection(db, "users", userId, "expenses");
    const snapshot = await getDocs(ref);
    
    console.log(userId, data);

    let maiorId = -1;
    snapshot.forEach((doc) => {
        const data = doc.data();
        if (typeof data.id === "number" && data.id > maiorId) {
            maiorId = data.id;
        }
    });
    
    const novoId = maiorId + 1;
    
    await setDoc(doc(ref, novoId.toString()), {
        ...data,
        id: novoId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    
    return ref.id;
}

export async function updateExpense(userId, expenseId, data) {
  const ref = doc(db, "users", userId, "expenses", expenseId);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return true;
}

export async function deleteExpense(userId, expenseId) {
  const ref = doc(db, "users", userId, "expenses", expenseId);
  await deleteDoc(ref);
  return true;
}

export async function getAllExpenses(userId) {
  const snapshot = await getDocs(collection(db, "users", String(userId), "expenses"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}