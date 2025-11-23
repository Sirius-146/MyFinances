import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';

const PREFIX = '@expenses';
const PENDING_SYNC_KEY = `${PREFIX}/pending_sync`;

/* ============================================================
 * KEY HELPERS
 * ============================================================*/

export function getMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${PREFIX}/${year}-${month}`;
}

/* ============================================================
 * STORAGE HELPERS
 * ============================================================*/

export async function getLocalExpenses(userId, monthKey) {
  try {
    const key = monthKey || getMonthKey();
    const data = await AsyncStorage.getItem(key);

    const list = data ? JSON.parse(data) : [];

    return list.filter(item => String(item.userId ?? item.user_id ?? '') === String(userId));
  } catch (error) {
    console.log("Erro getLocalExpenses:", error);
    return [];
  }
}

async function setLocalExpenses(monthKey, expenses) {
  try {
    if (!monthKey) monthKey = getMonthKey();
    await AsyncStorage.setItem(monthKey, JSON.stringify(expenses));
  } catch (error) {
    console.log("Erro setLocalExpenses:", error);
  }
}

/* ============================================================
 * AUXILIAR — DESCOBRIR MÊS DE UMA DESPESA
 * ============================================================*/

function getMonthKeyFromItem(item) {
  if (!item?.date) return getMonthKey();
  return getMonthKey(new Date(item.date));
}

/* ============================================================
 * PENDING SYNC QUEUE
 * ============================================================*/

export async function getPendingSync() {
  try {
    const stored = await AsyncStorage.getItem(PENDING_SYNC_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.log("Erro getPendingSync:", error);
    return [];
  }
}

export async function clearPendingSync() {
  try {
    await AsyncStorage.removeItem(PENDING_SYNC_KEY);
    return true;
  } catch (error) {
    console.log("Erro clearPendingSync:", error);
    return false;
  }
}

export async function queuePendingSync(entry) {
  try {
    const stored = await getPendingSync();

    const normalized = {
      operation: entry.operation || "create",
      id: entry.id ?? entry.payload?.id ?? nanoid(),
      userId: entry.userId ?? entry.payload?.userId ?? null,
      payload: entry.payload ?? null,
      attempts: entry.attempts ?? 0,
      createdAt: Date.now()
    };

    stored.push(normalized);

    await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(stored));
    return true;

  } catch (error) {
    console.log("Erro queuePendingSync:", error);
    return false;
  }
}

/* ============================================================
 * CRUD LOCAL (CREATE / UPDATE / DELETE)
 * ============================================================*/

export async function saveExpenseLocal(expense, userId) {
  try {
    const id = expense.id || nanoid();
    const monthKey = getMonthKeyFromItem(expense);

    const stored = await getLocalExpenses(userId, monthKey);

    const item = {
      ...expense,
      userId,
      id,
      isLocalOnly: true,
      lastModified: Date.now(),
    };

    await setLocalExpenses(monthKey, [...stored, item]);

    // prepara payload que irá para sync
    const payloadForSync = {
      ...item,
    };

    // remove campos que não podem ir para Firestore
    delete payloadForSync.isLocalOnly;
    delete payloadForSync.lastModified;
    delete payloadForSync.userId; // redundante

    // Sempre entra na fila (mesmo online)
    await queuePendingSync({
      operation: "create",
      id,
      userId,
      payload: payloadForSync
    });

    return id;

  } catch (error) {
    console.log("Erro saveExpenseLocal:", error);
    return null;
  }
}

export async function updateExpenseLocal(id, updatedData, userId) {
  try {
    const monthKeys = await getAllMonthsStored();

    let targetKey = null;
    let targetItem = null;
    let list = [];

    for (const key of monthKeys) {
      const items = await getLocalExpenses(userId, key);
      const found = items.find(i => i.id === id);

      if (found) {
        targetKey = key;
        targetItem = found;
        list = items;
        break;
      }
    }

    if (!targetItem) return false;

    const updatedItem = {
      ...targetItem,
      ...updatedData,
      lastModified: Date.now(),
      userId
    };

    const updatedList = list.map(i => (i.id === id ? updatedItem : i));

    await setLocalExpenses(targetKey, updatedList);

    await queuePendingSync({
      operation: "update",
      id,
      userId,
      payload: updatedItem
    });

    return true;

  } catch (error) {
    console.log("Erro updateExpenseLocal:", error);
    return false;
  }
}

export async function deleteExpenseLocal(id, userId) {
  try {
    const monthKeys = await getAllMonthsStored();

    for (const key of monthKeys) {
      const list = await getLocalExpenses(userId, key);
      const exists = list.some(i => i.id === id);

      if (exists) {
        const newList = list.map(i =>
          i.id === id
            ? { ...i, deleted: true, lastModified: Date.now(), userId }
            : i
        );

        await setLocalExpenses(key, newList);

        await queuePendingSync({
          operation: "delete",
          id,
          userId
        });

        return true;
      }
    }

    return false;

  } catch (error) {
    console.log("Erro deleteExpenseLocal:", error);
    return false;
  }
}

/* ============================================================
 * LISTAGEM — APENAS O MÊS ATUAL
 * ============================================================*/

/* ============================================================
 * LISTAR TODOS OS MESES ARMAZENADOS (exceto fila)
 * ============================================================*/

export async function getAllMonthsStored() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys.filter(
      (k) => k.startsWith(`${PREFIX}/`) && k !== PENDING_SYNC_KEY
    );
  } catch (error) {
    console.log("Erro getAllMonthsStored:", error);
    return [];
  }
}
