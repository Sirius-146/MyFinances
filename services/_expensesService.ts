import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../lib/firebase";

interface Expense {
    id: string;
    category: string;
    date: string;
    description: string;
    payment: string;
    value: number;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Cria uma despesa no Firestore para um usuário específico.
 *
 * @async
 * @function createExpense
 * @param {string} userId - ID do usuário ao qual a despesa pertence.
 * @param {string} id - ID único da despesa que será criada..
 * @param {Object} data - Dados da despesa a serem armazenados.
 * @param {string} data.title - Título da despesa.
 * @param {number} data.amount - Valor monetário da despesa.
 * @param {string} [data.category] - Categoria da despesa.
 * @param {Date | FirebaseTimestamp} [data.createdAt] - Data de criação. Caso não enviada, o Firestore irá gerar automaticamente.
 *
 * @description
 * Esta função grava uma despesa no Firestore dentro do caminho:
 * `users/{userId}/expenses/{id}`.
 * Sempre registra o campo `updatedAt` com o timestamp atual do servidor.
 *
 * @returns {Promise<string>} Retorna o `id` da despesa criada.
 */
export async function createExpense(
    userId: string,
    id: string,
    data: Expense
): Promise<string> {
    const ref = doc(db, "users", userId, "expenses", id);

    await setDoc(
        ref,
        {
            ...data,
            createdAt: data.createdAt ?? serverTimestamp(),
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );

    return id;
}

/**
 * Atualiza os dados de uma despesa existente no Firestore.
 *
 * @async
 * @function updateExpense
 * @param {string} userId - ID do usuário proprietário da despesa.
 * @param {string} expenseId - Identificador único da despesa a ser atualizada.
 * @param {Object} data - Campos que serão atualizados no documento.
 * @description
 * A função atualiza uma despesa em `users/{userId}/expenses/{expenseId}`.
 * O campo `createdAt` é removido para evitar sobrescrita acidental.
 * Sempre atualiza `updatedAt` com o timestamp atual do servidor.
 *
 * @returns {Promise<boolean>} Retorna `true` quando a atualização for concluída.
 */
export async function updateExpense(
    userId: string,
    expenseId: string,
    data: Expense
): Promise<boolean> {
    type ExpenseUpdate = Omit<Expense, "createdAt" | "updatedAt">;

    const ref = doc(db, "users", userId, "expenses", expenseId);

    const clean: ExpenseUpdate = {
        id: data.id,
        category: data.category,
        date: data.date,
        description: data.description,
        payment: data.payment,
        value: data.value,
    };

    await updateDoc(ref, {
        ...clean,
        updatedAt: serverTimestamp(),
    });

    return true;
}

/**
 * Remove uma despesa do Firestore.
 *
 * @async
 * @function deleteExpense
 * @param {string} userId - ID do usuário dono do registro.
 * @param {string} expenseId - ID da despesa que será removida.
 * @description
 * Exclui permanentemente o documento localizado em:
 * `users/{userId}/expenses/{expenseId}`.
 *
 * @returns {Promise<boolean>} Retorna `true` após a exclusão ser efetuada.
 */
export async function deleteExpense(
    userId: string,
    expenseId: string
): Promise<boolean> {
    try {
        const ref = doc(db, "users", userId, "expenses", expenseId);
        await deleteDoc(ref);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

/**
 * Busca todas as despesas de um usuário referentes a um mês específico.
 *
 * @async
 * @function getMonthExpenses
 * @param {string} userId - ID do usuário dono das despesas.
 * @param {string|null} [monthKey=null] - Mês no formato `YYYY-MM`.
 * Se não informado, é usado o mês atual por padrão.
 *
 * @description
 * Esta função consulta o Firestore e retorna todas as despesas registradas
 * dentro do intervalo de datas do mês informado.
 *
 * - Se `monthKey` não for enviado, utiliza o mês atual via `getMonthKeyFromDate()`.
 * - Usa `getNextMonthKey(monthKey)` para criar um range de busca,
 * retornando documentos em que `date` esteja entre:
 * `monthKey-01` (inclusive) e `nextMonthKey-01` (exclusivo).
 *
 * A busca ocorre em `users/{userId}/expenses`.
 * Em caso de erro, o método registra no console e retorna um array vazio.
 *
 * @returns {Promise<Array<Object>>} Lista de despesas do mês,
 * cada item contendo `{ id, ...dadosDoDocumento }`.
 */
export async function getMonthExpenses(
    userId: string,
    monthKey = null
): Promise<object[]> {
    try {
        const finalMonthKey = monthKey || getMonthKeyFromDate();
        const nexMonthKey = getNextMonthKey(finalMonthKey);

        const colRef = collection(db, "users", String(userId), "expenses");

        const q = query(
            colRef,
            where("date", ">=", `${finalMonthKey}-01`),
            where("date", "<", `${nexMonthKey}-01`)
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (e) {
        console.error("Erro getMonthExpenses (mensal):", e);
        return [];
    }
}

export async function getAllExpenses(userId: string) {
    try {
        const colRef = collection(db, "users", String(userId), "expenses");

        const snapshot = await getDocs(colRef);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (e) {
        console.error("Erro getAllExpenses:", e);
        return [];
    }
}

/*
 * FUNÇÕES AUXILIARES
 */
function getMonthKeyFromDate(date = new Date()) {
    return date.toISOString().slice(0, 7);
}

function getNextMonthKey(monthKey: string) {
    const [y, m] = monthKey.split("-").map(Number);
    const next = new Date(y, m, 1); // m já é 0-based aqui
    return next.toISOString().slice(0, 7);
}
