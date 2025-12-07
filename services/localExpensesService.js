import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid/non-secure";
import { getPendingSync, queuePendingSync } from "../services/syncService";

const PREFIX = "@expenses";
const PENDING_SYNC_KEY = `${PREFIX}/pending_sync`;

/* ============================================================
 * STORAGE HELPERS
 * ============================================================
 */

/**
 * Retorna todas as despesas armazenadas localmente para um usuário e mês específico.
 *
 * @async
 * @function getLocalExpenses
 * @param {string|number} userId - ID do usuário para filtrar as despesas.
 * @param {string} [monthKey] - Chave do mês no formato `PREFIX/YYYY-MM`.
 * Se não informado, utiliza `getMonthKey()` para o mês atual.
 *
 * @description
 * A função busca no AsyncStorage os dados referentes ao mês solicitado,
 * converte para objeto e filtra apenas despesas pertencentes ao usuário,
 * garantindo compatibilidade com possíveis variações de campo:
 * `userId` ou `user_id`.
 *
 * Estrutura de leitura:
 * ```
 * AsyncStorage[key] -> JSON -> Array<Expense>
 * ```
 *
 * Em caso de erro, retorna um array vazio e registra o erro no console.
 *
 * @returns {Promise<Array<Object>>} Lista de despesas locais filtradas pelo usuário.
 */
export async function getLocalExpenses(userId, monthKey) {
    try {
        const key = monthKey || getMonthKey();
        const data = await AsyncStorage.getItem(key);

        const list = data ? JSON.parse(data) : [];

        return list.filter(
            (item) =>
                String(item.userId ?? item.user_id ?? "") === String(userId)
        );
    } catch (error) {
        console.log("Erro getLocalExpenses:", error);
        return [];
    }
}

/**
 * Armazena localmente a lista completa de despesas para o mês informado.
 *
 * @async
 * @function setLocalExpenses
 * @private
 * @param {string} monthKey - Chave do mês no formato `PREFIX/YYYY-MM`.
 * Caso não seja fornecida, a chave do mês atual será usada automaticamente.
 * @param {Array<Object>} expenses - Lista completa de despesas a serem salvas.
 *
 * @description
 * Sobrescreve o conteúdo armazenado no AsyncStorage para o mês especificado.
 * Não faz merge — substitui totalmente o valor anterior.
 *
 * Em caso de falha, registra o erro no console, sem lançar exceção.
 *
 * @returns {Promise<void>}
 */
async function setLocalExpenses(monthKey, expenses) {
    try {
        if (!monthKey) monthKey = getMonthKey();
        await AsyncStorage.setItem(monthKey, JSON.stringify(expenses));
    } catch (error) {
        console.log("Erro setLocalExpenses:", error);
    }
}

/* ============================================================
 * CRUD LOCAL (CREATE / UPDATE / DELETE)
 * ============================================================*/

/**
 * Salva uma despesa localmente no AsyncStorage e agenda sua sincronização
 * posterior com o Firestore por meio do sistema de fila (`queuePendingSync`).
 *
 * @async
 * @function saveExpenseLocal
 * @param {Object} expense - Dados da despesa a ser salva localmente.
 * @param {string|number} userId - ID do usuário proprietário da despesa.
 *
 * @description
 * Este método registra uma nova despesa **offline-first**, salvando no armazenamento
 * local e adicionando uma tarefa de sincronização para envio posterior ao Firestore.
 *
 * Funcionamento:
 * 1. Gera um novo `id` local com `nanoid()`.
 * 2. Obtém o `monthKey` baseado na data do item via `getMonthKeyFromItem`.
 * 3. Carrega despesas atuais do mês com `getLocalExpenses`.
 * 4. Cria um objeto completo adicionando:
 *    - `isLocalOnly: true` — indica que ainda não está sincronizado
 *    - `lastModified` — timestamp local para controle de alterações
 * 5. Salva o item no AsyncStorage com `setLocalExpenses`.
 * 6. Prepara `payloadForSync`, removendo campos não aceitos pelo Firestore.
 * 7. Insere a operação na fila de sincronização com:
 *    ```
 *    queuePendingSync({
 *      operation: "create",
 *      id,
 *      userId,
 *      payload
 *    })
 *    ```
 *
 * Mesmo se o usuário estiver online, **a operação sempre vai para a fila**,
 * garantindo consistência e permitindo repetição em caso de falha.
 *
 * @returns {Promise<string|null>}
 * - Retorna o `id` da despesa criada localmente.
 * - Retorna `null` em caso de erro.
 */
export async function saveExpenseLocal(expense, userId) {
    try {
        const id = nanoid();
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
            payload: payloadForSync,
        });

        return id;
    } catch (error) {
        console.log("Erro saveExpenseLocal:", error);
        return null;
    }
}

/**
 * Atualiza uma despesa já existente no armazenamento local e registra
 * a operação na fila de sincronização com o Firestore.
 *
 * @async
 * @function updateExpenseLocal
 * @param {string} id - ID da despesa local que será atualizada.
 * @param {Object} updatedData - Dados modificados que devem substituir/mesclar o item original.
 * @param {string|number} userId - ID do usuário dono da despesa.
 *
 * @description
 * O método permite edição de despesas armazenadas offline. Ele:
 *
 * 1. Busca em todos os meses armazenados (`getAllMonthsStored()`) até encontrar o item.
 * 2. Recupera a lista do mês correto e identifica o item correspondente ao `id`.
 * 3. Mescla os novos dados com o objeto original.
 * 4. Marca `lastModified` para controle e regrava o item no AsyncStorage.
 * 5. Enfileira uma operação **update** para futura sincronização com o Firestore.
 *
 * Observações:
 * - Apenas atualiza se a despesa existir localmente.
 * - O `payload` vai com todos os dados do item atualizado para sincronização posterior.
 * - Campo `userId` é mantido explicitamente para garantir rastreamento no envio.
 * - O retorno **não garante** sincronização imediata — apenas que foi atualizado localmente.
 *
 * Fluxo resumido:
 * ```
 * Local Storage  -> Atualiza item
 * Queue Pending -> { operation:"update", id, userId, payload }
 * Sync Worker   -> Envia ao Firestore quando possível
 * ```
 *
 * @returns {Promise<boolean>}
 * - `true` se a despesa foi atualizada com sucesso localmente.
 * - `false` se não encontrada ou se ocorrer erro.
 */
export async function updateExpenseLocal(id, updatedData, userId) {
    try {
        const monthKeys = await getAllMonthsStored();

        let targetKey = null;
        let targetItem = null;
        let list = [];

        for (const key of monthKeys) {
            const items = await getLocalExpenses(userId, key);
            const found = items.find((i) => i.id === id);

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
            userId,
        };

        const updatedList = list.map((i) => (i.id === id ? updatedItem : i));

        await setLocalExpenses(targetKey, updatedList);

        await queuePendingSync({
            operation: "update",
            id,
            userId,
            payload: updatedItem,
        });

        return true;
    } catch (error) {
        console.log("Erro updateExpenseLocal:", error);
        return false;
    }
}

/**
 * Marca uma despesa como deletada no armazenamento local e
 * adiciona uma operação de remoção à fila de sincronização.
 *
 * @async
 * @function deleteExpenseLocal
 * @param {string} id - ID da despesa local que será marcada como deletada.
 * @param {string|number} userId - ID do usuário vinculada à despesa.
 *
 * @description
 * Realiza um "soft delete" no registro local — a despesa não é removida
 * imediatamente do AsyncStorage, apenas recebe a flag `deleted: true`
 * para que posteriormente o serviço de sincronização conclua a remoção
 * no Firestore.
 *
 * Funcionamento:
 * 1. Obtém todos os `monthKeys` existentes (`getAllMonthsStored()`).
 * 2. Procura em cada mês até localizar o item com o `id` especificado.
 * 3. Atualiza o item alvo adicionando:
 *    - `deleted: true` → marcação para exclusão posterior
 *    - `lastModified` → usado em resoluções de conflito
 *    - `userId` → reforçado para envio no sync
 * 4. Sobrescreve a lista no AsyncStorage com `setLocalExpenses`.
 * 5. Cria uma entrada na fila de sincronização:
 *    ```
 *    queuePendingSync({
 *      operation: "delete",
 *      id,
 *      userId
 *    })
 *    ```
 *
 * Observações:
 * - Não remove imediatamente o item local — apenas marca.
 * - A exclusão real deve acontecer durante a sincronização remota.
 * - Retorna `false` caso o item não seja encontrado em nenhum mês.
 *
 * @returns {Promise<boolean>}
 * - `true` se a marcação para remoção foi aplicada e o sync enfileirado.
 * - `false` se a despesa não foi localizada ou ocorreu erro.
 */
export async function deleteExpenseLocal(id, userId) {
    try {
        const monthKeys = await getAllMonthsStored();

        for (const key of monthKeys) {
            const list = await getLocalExpenses(userId, key);
            const exists = list.some((i) => i.id === id);

            if (exists) {
                const newList = list.map((i) =>
                    i.id === id
                        ? {
                              ...i,
                              deleted: true,
                              lastModified: Date.now(),
                              userId,
                          }
                        : i
                );

                await setLocalExpenses(key, newList);

                await queuePendingSync({
                    operation: "delete",
                    id,
                    userId,
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

/**
 * Remove permanentemente todas as despesas locais de um usuário,
 * incluindo registros armazenados por mês e itens pendentes na fila
 * de sincronização.
 *
 * @async
 * @function wipeExpensesLocal
 * @param {string|number} userId - ID do usuário que terá os dados locais apagados.
 *
 * @description
 * Esta função faz a limpeza completa dos dados locais relacionados a um
 * usuário específico. Diferente de `deleteExpenseLocal` (que marca para exclusão),
 * aqui os dados são **removidos imediatamente e sem possibilidade de recuperação**.
 *
 * A rotina executa:
 *
 * 1. Obtém todas as chaves de meses armazenados (`getAllMonthsStored()`).
 * 2. Para cada mês:
 *    - Carrega despesas com `getLocalExpenses`.
 *    - Remove apenas as despesas pertencentes ao usuário informado.
 *    - Salva o resultado com `setLocalExpenses`, preservando dados de outros usuários (se houver).
 *    - (Opcional) pode limpar totalmente o mês se vazio — trecho já comentado.
 *
 * 3. A fila de sincronização pendente (`getPendingSync()`) também é filtrada,
 *    removendo operações relacionadas ao mesmo usuário.
 *
 * Essa função é adequada para:
 * - logout definitivo
 * - troca de conta
 * - limpeza total antes de sincronização
 *
 * Atenção:
 * - Não interfere em dados salvos no Firestore.
 * - A remoção é permanente no armazenamento local.
 *
 * @returns {Promise<boolean>}
 * - `true` em caso de sucesso.
 * - `false` se ocorrer erro durante o processo.
 */
export async function wipeExpensesLocal(userId) {
    try {
        const monthKeys = await getAllMonthsStored();

        for (const key of monthKeys) {
            const expenses = await getLocalExpenses(userId, key);

            const remaining = expenses.filter((e) => e.userId !== userId);

            await setLocalExpenses(key, remaining);

            //limpa mês vazio
            // if (remaining.length === 0) await AsyncStorage.removeItem(key);
        }

        const pending = await getPendingSync();
        const newPending = pending.filter((p) => p.userId !== userId);

        await AsyncStorage.setItem(
            PENDING_SYNC_KEY,
            JSON.stringify(newPending)
        );

        console.log("✔ Todos os dados locais removidos permanentemente");
        return true;
    } catch (error) {
        console.log("Erro wipeExpensesLocal:", error);
        return false;
    }
}

/* ============================================================
 * KEY HELPERS
 * ============================================================*/

/**
 * Gera uma chave de identificação mensal a partir de uma data.
 *
 * @function getMonthKey
 * @param {Date} [date=new Date()] - Data base para gerar a chave.
 * Caso não seja fornecida, utiliza a data atual.
 *
 * @description
 * Retorna uma string no formato `PREFIX/YYYY-MM`, onde:
 * - `PREFIX` é um valor constante definido no contexto do projeto.
 * - `YYYY` representa o ano com quatro dígitos.
 * - `MM` representa o mês com dois dígitos (com zero à esquerda quando necessário).
 *
 * Essa chave é útil para organizar e indexar dados mensais,
 * especialmente em sistemas de armazenamento local ou filtros por mês.
 *
 * @returns {string} A chave formatada no padrão `PREFIX/YYYY-MM`.
 */
function getMonthKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${PREFIX}/${year}-${month}`;
}

/* ============================================================
 * AUXILIAR — DESCOBRIR MÊS DE UMA DESPESA
 * ============================================================*/

function getMonthKeyFromItem(item) {
    if (!item?.date) return getMonthKey();
    return getMonthKey(new Date(item.date));
}

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
