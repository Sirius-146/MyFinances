import NetInfo from "@react-native-community/netinfo";
import { useEffect } from "react";
import { useSync } from "./use-sync";

export function useAutoSync() {
    const {syncNow } = useSync();

    useEffect(() =>{
        const unsubscribe = NetInfo.addEventListener(state => {
            if(state.isConnected && state.isInternetReachable){
                console.log("Internet voltou -> sincronizando...");
                syncNow();
            }
        });

        return () => unsubscribe();
    }, []);
}