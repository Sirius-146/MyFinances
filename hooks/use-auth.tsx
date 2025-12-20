import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import { auth, db } from "@/lib/firebase";

/**
 * Tipo do usuário exposto para o app
 * (não exponha o Firebase User inteiro)
 */
export interface AppUser {
    uid: string;
    email?: string;
    name?: string;
    [key: string]: any;
}

interface AuthContextData {
    user: AppUser | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextData>({
    user: null,
    loading: true,
});

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            async (currentUser: FirebaseUser | null) => {
                try {
                    if (currentUser) {
                        const userRef = doc(db, "users", currentUser.uid);
                        const snap = await getDoc(userRef);

                        setUser({
                            uid: currentUser.uid,
                            email: currentUser.email ?? undefined,
                            ...snap.data(),
                        });
                    } else {
                        setUser(null);
                    }
                } catch (error) {
                    console.log("Erro ao carregar usuário:", error);
                    setUser(null);
                } finally {
                    setLoading(false);
                }
            }
        );

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextData {
    return useContext(AuthContext);
}
