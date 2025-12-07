import { useCallback, useEffect, useRef, useState } from "react";
import { syncPendingExpenses } from "../services/syncService";

export function useSync() {
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [errors, setErrors] = useState(null);

    const isMounted = useRef(true);

    // Sincronização manual ou automática
    const syncNow = useCallback(async () => {
        if (syncing) return;

        setSyncing(true);
        setErrors(null);

        try {
            const result = await syncPendingExpenses();
            console.log("SYNC RESULT:", result);

            if (isMounted.current) {
                setLastSync(Date.now());
                if (result?.failed && result.failed > 0) {
                    setErrors(`Falharam ${result.failed} operações`);
                }
            }
        } catch (e) {
            if (isMounted.current) {
                setErrors(String(e));
            }
        }

        if (isMounted.current) {
            setSyncing(false);
        }
    }, [syncing]);

    // Limpando referência
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    return {
        syncNow,
        syncing,
        lastSync,
        errors,
    };
}
