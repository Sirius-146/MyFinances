// ================================
// syncService.js
// ================================

import { saveExpenseFirestore } from "../services/expensesService";
import { clearPendingSync, getPendingSync } from "../services/localExpensesService";

// Envia pendências para o Firestore
export async function syncPendingExpenses() {
  try {
    const pending = await getPendingSync();
    if (!pending.length) return;

    for (const item of pending) {
      await saveExpenseFirestore(item);
    }

    await clearPendingSync();
  } catch (error) {
    console.log('Erro syncPendingExpenses:', error);
  }
}