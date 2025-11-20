import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export async function createExpense(userId, id, data) {
  const ref = doc(db, "users", userId, "expenses", id);

  await setDoc(ref, {
        ...data,
        createdAt: data.createdAt ?? serverTimestamp(),
        updatedAt: serverTimestamp(),
    }, { merge: true });
    
    return id;
}

export async function updateExpense(userId, expenseId, data) {
  const ref = doc(db, "users", userId, "expenses", expenseId);

  const clean = { ...data };
  delete clean.createdAt;

  await updateDoc(ref, {
    ...clean,
    updatedAt: serverTimestamp(),
  });
  
  return true;
}

export async function deleteExpense(userId, expenseId) {
  const ref = doc(db, "users", userId, "expenses", expenseId);
  await deleteDoc(ref);
  return true;
}

/**
 * Busca as despesas do Firestore filtrando pelo mês.
 * 
 * @param {string} userId
 * @param {string|null} monthKey - Ex: "2025-11" (opcional)
 */
export async function getAllExpenses(userId, monthKey = null) {
  try{
    const finalMonthKey = monthKey || getMonthKeyFromDate();
    const nexMonthKey = getNextMonthKey(finalMonthKey);

    const colRef = collection(db, "users", String(userId), "expenses");

    const q = query(
      colRef,
      where("date", ">=", `${finalMonthKey}-01`),
      where("date", "<", `${nexMonthKey}-01`),
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch(e) {
    console.error("Erro getAllExpenses (mensal):", e);
    return [];
  }
}

/*
* FUNÇÕES AUXILIARES
 */
function getMonthKeyFromDate(date = new Date()){
  return date.toISOString().slice(0,7);
}

function getNextMonthKey(monthKey){
  const [y, m] = monthKey.split('-').map(Number);
  const next = new Date(y, m, 1); // m já é 0-based aqui
  return next.toISOString().slice(0, 7);
}