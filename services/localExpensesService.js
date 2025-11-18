import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPENSES_KEY = '@expenses_storage_key';
const PENDING_SYNC_KEY = '@expenses_pending_sync';

// Busca todas as despesas salvas localmente
export async function getLocalExpenses() {
  try {
    const data = await AsyncStorage.getItem(EXPENSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log('Erro getLocalExpenses:', error);
    return [];
  }
}

// Salva nova despesa localmente
export async function saveExpenseLocal(expense) {
  try {
    const stored = await getLocalExpenses();
    const updated = [...stored, expense];
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.log('Erro saveExpenseLocal:', error);
    return false;
  }
}

// Atualiza despesa local
export async function updateExpenseLocal(id, updatedData) {
  try {
    const stored = await getLocalExpenses();
    const updated = stored.map(item => item.id === id ? { ...item, ...updatedData } : item);
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.log('Erro updateExpenseLocal:', error);
    return false;
  }
}

// Remove despesa local
export async function deleteExpenseLocal(id) {
  try {
    const stored = await getLocalExpenses();
    const updated = stored.filter(item => item.id !== id);
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.log('Erro deleteExpenseLocal:', error);
    return false;
  }
}

// Marca uma despesa para sincronizar posteriormente
export async function queuePendingSync(expense) {
  try {
    const stored = await AsyncStorage.getItem(PENDING_SYNC_KEY);
    const list = stored ? JSON.parse(stored) : [];
    const updated = [...list, expense];
    await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(updated));
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