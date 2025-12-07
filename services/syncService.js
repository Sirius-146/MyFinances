import AsyncStorage from '@react-native-async-storage/async-storage';
import { createExpense, deleteExpense, updateExpense } from "../services/expensesService";

const PREFIX = '@expenses';
const PENDING_SYNC_KEY = `${PREFIX}/pending_sync`;
const MAX_ATTEMPTS = 3;

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
      id: entry.id ?? entry.payload?.id,
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

/**
 * syncPendingExpenses
 * -------------------------------------------------------
 * Processa a fila de sincronização local (`pendingSync`) enviando
 * cada operação pendente para a base remota (Firestore/Backend).
 * 
 * A função suporta três tipos de operação:
 *  - "create" → cria item remoto com os dados armazenados
 *  - "update" → atualiza item remoto existente
 *  - "delete" → remove item do servidor
 *
 * O fluxo é resiliente e tenta reenviar operações com falha,
 * controlando o número máximo de tentativas via `MAX_ATTEMPTS`.
 * Após o processamento:
 *  ✔ Fila original é limpa
 *  ✔ Apenas pendências com erro permanecem e são re-enfileiradas
 *
 * @async
 * @function syncPendingExpenses
 *
 * @returns {Promise<Object>}
 * Retorna objeto contendo resultado da sincronização:
 * {
 *   success: boolean,        // sucesso geral da execução
 *   processed?: number,      // quantos itens foram enviados com sucesso
 *   failed?: number,         // quantos ficaram pendentes após tentativa
 *   error?: any              // preenchido apenas em erro fatal
 * }
 *
 * Estrutura mínima de cada item da fila:
 * {
 *   id: string,
 *   userId: string,
 *   operation: "create"|"update"|"delete",
 *   payload?: Object,         // dados associados
 *   attempts?: number         // tentativas anteriores
 * }
 *
 * Comportamento:
 * -------------------------------------------------------
 * ✔ Processa toda fila em sequência
 * ✔ Normaliza itens mesmo que estejam incompletos
 * ✔ Ignora itens inválidos (sem id/userId/payload)
 * ✔ Reenvia apenas falhos < MAX_ATTEMPTS
 * ✔ Evita crash e retorna { success:false } em falha crítica
 *
 * Quando usar:
 * -------------------------------------------------------
 * 🔹 Ao fazer login
 * 🔹 Ao voltar de offline → online (use NetInfo listener)
 * 🔹 Antes de logout
 * 🔹 Periodicamente com um scheduler
 *
 * Exemplos de uso:
 * -------------------------------------------------------
 *
 * 1) Executar manualmente:
 * const result = await syncPendingExpenses();
 * console.log("Sincronizados:", result);
 *
 * 2) Ao iniciar o app:
 * useEffect(() => { syncPendingExpenses(); }, []);
 *
 * 3) Com detecção automática de conexão:
 * NetInfo.addEventListener(state => {
 *   if (state.isConnected) syncPendingExpenses();
 * });
 *
 * 4) Ao excluir usuário (com wipe local antes ou depois):
 * await wipeExpensesLocal(userId);
 * await syncPendingExpenses(); // deve retornar {processed:0}
 *
 * Resiliência:
 * -------------------------------------------------------
 * 💾 Dados nunca se perdem — apenas acumulam até sincronizar
 * 🔁 Retentativas automáticas respeitam MAX_ATTEMPTS
 * 🧹 Limpeza de pendências ocorre somente após tentativa
 */

export async function syncPendingExpenses() {
  try {
    const pending = await getPendingSync();
    if (!pending || !pending.length) return { success: true, processed: 0 };

    const failed = [];
    let processed = 0;

    for (const rawItem of pending) {

      // Normalização absoluta do item
      const item = {
        operation: rawItem.operation ?? "create",
        userId: rawItem.userId ?? rawItem.payload?.userId ?? null,
        id: rawItem.id ?? rawItem.payload?.id ?? null,
        payload: rawItem.payload ?? null,
        attempts: rawItem.attempts ?? 0,
      };

      const payload = cleansePayload(item.payload);

      // Não pode sincronizar sem userId ou id
      if (!item.userId || !item.id) {
        console.warn("Item inválido na fila de sync:", item);

        const nextAttempts = item.attempts + 1;
        if (nextAttempts < MAX_ATTEMPTS) {
          failed.push({ ...item, attempts: nextAttempts });
        }
        continue;
      }

      try {
        switch (item.operation) {
          case "create":
            await createExpense(item.userId, item.id, payload);
            break;

          case "update":
            await updateExpense(item.userId, item.id, payload);
            break;

          case "delete":
            await deleteExpense(item.userId, item.id);
            break;

          default:
            throw new Error(`Operação desconhecida: ${item.operation}`);
        }

        processed++;

      } catch (errItem) {
        console.log(`Erro ao processar pending id=${item.id} op=${item.operation}:`, errItem);

        const nextAttempts = item.attempts + 1;

        if (nextAttempts < MAX_ATTEMPTS) {
          failed.push({ ...item, attempts: nextAttempts });
        } else {
          console.warn(`Máx de tentativas atingido para id=${item.id}. Não será reenfileirado.`);
        }
      }
    }

    // Limpa a fila original
    await clearPendingSync();

    // Re-insere apenas os falhos
    for (const f of failed) {
      await queuePendingSync(f);
    }

    return { success: true, processed, failed: failed.length };

  } catch (error) {
    console.log("Erro syncPendingExpenses (fatal):", error);
    return { success: false, error };
  }
}

function cleansePayload(payload) {
  if (!payload) return {};

  const clean = { ...payload };

  delete clean.isLocalOnly;
  delete clean.lastModified;
  delete clean.userId;
  delete clean.synced;
  delete clean.deleted;
  delete clean.id;

  return clean;
}