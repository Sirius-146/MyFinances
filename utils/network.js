import NetInfo from "@react-native-community/netinfo";

/**
 * Retorna booleano se está online (true) ou offline (false)
 * Usa NetInfo.fetch() que retorna a informação atual
 */
export async function isOnline() {
    try {
        const state = await NetInfo.fetch();
        // Considera online quando está conectado e internetReachable !== false
        // (algumas redes marcam connected=true mas sem internet)
        return !!(
            state.isConnected &&
            (state.isInternetReachable === null ||
                state.isInternetReachable === true)
        );
    } catch (error) {
        console.log("Erro isOnline:", error);
        return false;
    }
}
