import { createExpense, deleteExpense, updateExpense } from "../services/expensesService";
import { clearPendingSync, getPendingSync, queuePendingSync } from "../services/localExpensesService";

const MAX_ATTEMPTS = 3;

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