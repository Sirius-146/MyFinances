import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure'; // leve e ideal para React Native

const EXPENSES_KEY = '@expenses_storage_key';
const PENDING_SYNC_KEY = '@expenses_pending_sync';

/* ============================================================
 * LER / SALVAR DADOS LOCAIS
 * ============================================================*/

export async function getLocalExpenses() {
  try {
    const data = await AsyncStorage.getItem(EXPENSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log('Erro getLocalExpenses:', error);
    return [];
  }
}

async function setLocalExpenses(expenses){
  try{
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }catch(error){
    console.log("Erro setLocalExpenses:", error)
  }
}

/* ============================================================
 * CRUD LOCAL COM MARCAÇÃO PARA SYNC
 * ============================================================*/

/**
 * Cria despesa local com id local automático.
 * Gera um ID se não vier do formulário.
 */
export async function saveExpenseLocal(expense, userId) {
  try {
    const stored = await getLocalExpenses();

    const id = expense.id || nanoid();
    console.log("Id: ", id);
    console.log("expense: ", expense)

    const item = {
      ...expense,
      id,
      userId,
      lastModified: Date.now()
    };

    await setLocalExpenses([...stored, item]);

    await queuePendingSync({
      operation: "create",
      id,
      userId,
      payload: item
    });

    return true;
  } catch (error) {
    console.log('Erro saveExpenseLocal:', error);
    return false;
  }
}

/**
 * Atualiza despesa local
 */
export async function updateExpenseLocal(id, updatedData, userId) {
  try {
    const stored = await getLocalExpenses();

    const updated = stored.map(item =>
      item.id === id
        ? { ...item, ...updatedData, lastModified: Date.now() }
        : item
    );

    await setLocalExpenses(updated);

    await queuePendingSync({
      operation: "update",
      id,
      userId,
      payload: {
        ...updatedData,
        id,
        userId
      }
    });

    return true;
  } catch (error) {
    console.log('Erro updateExpenseLocal:', error);
    return false;
  }
}

/**
 * Não remove local imediatamente — marca como deleted
 */
export async function deleteExpenseLocal(id, userId) {
  try {
    const stored = await getLocalExpenses();

    const updated = stored.map(item =>
      item.id === id
        ? { ...item, deleted: true, lastModified: Date.now() }
        : item
    );

    await setLocalExpenses(updated)

    await queuePendingSync({
      operation: "delete",
      id,
      userId
    });

    return true;
  } catch (error) {
    console.log('Erro deleteExpenseLocal:', error);
    return false;
  }
}

/* ============================================================
 * FILA DE PENDÊNCIAS
 * ============================================================*/

/**
 * Padroniza a entrada antes de salvar.
 * Garante sempre userId, id, payload, attempts...
 */
export async function queuePendingSync(entry) {
  try {
    const stored = await AsyncStorage.getItem(PENDING_SYNC_KEY);
    const list = stored ? JSON.parse(stored) : [];

    const normalized = {
      operation: entry.operation || "create",
      id: entry.id || entry.payload?.id || nanoid(),
      userId: entry.userId || entry.payload?.userId,
      payload: entry.payload || null,
      attempts: entry.attempts || 0,
      createdAt: Date.now()
    };

    list.push(normalized);
    
    await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(list));
  } catch (error) {
    console.log('Erro queuePendingSync:', error);
  }
}

// Busca fila pendente
export async function getPendingSync() {
  try {
    const stored = await AsyncStorage.getItem(PENDING_SYNC_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.log('Erro getPendingSync:', error);
    return [];
  }
}

// Limpa a fila de pendências
export async function clearPendingSync() {
  try {
    await AsyncStorage.removeItem(PENDING_SYNC_KEY);
  } catch (error) {
    console.log('Erro clearPendingSync:', error);
  }
}