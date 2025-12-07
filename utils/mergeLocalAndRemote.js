/**
 * Converte timestamps: aceita number, Date ou Firestore Timestamp.
 */
function toMillis(t) {
    if (!t) return 0;
    if (typeof t === "number") return t;
    if (t instanceof Date) return t.getTime();
    if (typeof t.toMillis === "function") return t.toMillis();
    return 0;
}

/**
 * MERGE FINAL ENTRE LOCAL + REMOTO
 *
 * REGRAS:
 * - Se local.deleted === true → sempre mantém local (até sync resolver)
 * - Se item existe na fila de pendências → prefere local
 * - Caso contrário, compara local.lastModified vs remote.updatedAt
 * - Remotos novos entram
 * - Itens deletados não aparecem no resultado final
 */
export function mergeLocalAndRemote(local = [], remote = [], pending = []) {
    const map = new Map();

    // ==========================
    // 1. Indexar pendências por ID
    // ==========================
    const pendingIds = new Set(pending.map((p) => String(p.id)));

    // ==========================
    // 2. Inserir todos os locais no mapa
    // ==========================
    for (const l of local) {
        if (!l?.id) continue;
        map.set(String(l.id), { source: "local", value: l });
    }

    // ==========================
    // 3. Processar remotos
    // ==========================
    for (const r of remote) {
        if (!r?.id) continue;

        const id = String(r.id);
        const localEntry = map.get(id);

        const remoteUpdatedAt = toMillis(r.updatedAt);
        const localLastMod = localEntry?.value?.lastModified ?? 0;
        const localIsDeleted = localEntry?.value?.deleted === true;
        const localExists = !!localEntry;

        // --- regra 1: se local foi deletado, mantém local até sincronizar
        if (localIsDeleted) {
            map.set(id, { source: "local", value: localEntry.value });
            continue;
        }

        // --- regra 2: se o item está na fila de sync, preferir local
        if (pendingIds.has(id)) {
            if (localExists) {
                map.set(id, { source: "local", value: localEntry.value });
            } else {
                // (caso raro) pendência sem dado local → cria local
                map.set(id, { source: "local", value: r });
            }
            continue;
        }

        // --- regra 3: item novo no remoto
        if (!localExists) {
            map.set(id, { source: "remote", value: r });
            continue;
        }

        // --- regra 4: comparar timestamps
        if (remoteUpdatedAt > localLastMod) {
            map.set(id, { source: "remote", value: r });
        } else {
            map.set(id, { source: "local", value: localEntry.value });
        }
    }

    // ==========================
    // 4. Montar array final
    // ==========================
    const merged = [];

    for (const { value } of map.values()) {
        if (!value) continue;
        if (value.deleted) continue; // nunca mostrar deletados
        merged.push(value);
    }

    // ==========================
    // 5. Ordenar por data (últimas primeiro)
    // ==========================
    merged.sort((a, b) => {
        const ta = a.date ? new Date(a.date).getTime() : a.lastModified || 0;
        const tb = b.date ? new Date(b.date).getTime() : b.lastModified || 0;
        return tb - ta;
    });

    return merged;
}
