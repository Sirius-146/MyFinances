import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { User, updateEmail } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../../lib/firebase";
import ModernButton from "../../utils/ModernButton";
import styles from "./styles/styles";

export default function Perfil() {
    const inputBg = useThemeColor(
        { light: "#f5f5f5", dark: "#1a1a1a" },
        "background"
    );
    const border = useThemeColor({ light: "#ccc", dark: "#444" }, "text");
    const text = useThemeColor({ light: "#333", dark: "#eee" }, "text");
    const icon = useThemeColor({ light: "#000", dark: "#fff" }, "text");

    const user: User | null = auth.currentUser;

    interface IUserData {
        name?: string;
        email?: string;
        [key: string]: any;
    }

    const [formEdited, setFormEdited] = useState<boolean>(false);

    const updateField = (setter: (v: string) => void, value: string) => {
        setter(value);
        setFormEdited(true);
    };

    const [originalData, setOriginalData] = useState<IUserData>({});
    const [email, setEmail] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [profileName, setProfileName] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(false);

    const [fakeLength, setFakeLength] = useState<number>();
    const senhaOculta = "●".repeat(Number(fakeLength));

    useEffect(() => {
        setFakeLength(generateFakePasswordLength());
    }, []);

    useEffect(() => {
        async function loadUserData() {
            if (!user?.uid) return;

            try {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data() as IUserData;
                    setOriginalData(data);
                    setName(data.name ?? "");
                    setProfileName(data.name ?? "");
                }

                setEmail(user.email ?? "");
            } catch (error) {
                console.error("Erro ao carregar dados do usuário:", error);
            }
        }

        loadUserData().then(() => setFormEdited(false));
    }, [user]);

    function generateFakePasswordLength(min = 6, max = 17): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async function updateData() {
        if (!user?.uid) {
            Alert.alert("Erro", "Usuário não encontrado");
            return;
        }

        const dadosAtualizados: IUserData = {};
        if (name !== originalData.name) dadosAtualizados.name = name;

        const emailChanged = email !== user.email;

        if (Object.keys(dadosAtualizados).length === 0 && !emailChanged) {
            Alert.alert("Aviso", "Nenhum dado foi alterado.");
            return;
        }

        try {
            setLoading(true);

            if (emailChanged) await updateEmail(user, email);

            if (Object.keys(dadosAtualizados).length > 0)
                await updateDoc(doc(db, "users", user.uid), dadosAtualizados);

            setOriginalData({ ...originalData, ...dadosAtualizados });
            setProfileName(name);
            setFormEdited(false);

            Alert.alert("Sucesso", "Dados atualizados!");
        } catch (error) {
            console.log(error);
            Alert.alert("Erro", "Não foi possível atualizar os dados.");
        } finally {
            setLoading(false);
        }
    }

    const campos = [
        {
            label: "Nome",
            value: name,
            setter: setName,
            placeholder: "Digite seu nome",
        },
        {
            label: "Email",
            value: email,
            setter: setEmail,
            placeholder: "Digite seu email",
        },
    ];

    // const ProfilePicture = ({userImage}) => {
    //     const defaultImage = require('../../source/perfil.png');
    //     const profileImage = userImage ? {url: userImage} : {url: defaultImage};

    //     return(
    //         <View style={styles.imageContainer}>
    //             <Image source={defaultImage} style={styles.image} />
    //         </View>
    //     )
    // }

    return (
        <ThemedView style={{ flex: 1, padding: 10, marginTop: 30 }}>
            <View style={{ alignSelf: "flex-end", marginBottom: 15 }}>
                <TouchableOpacity
                    onPress={() => router.push("/profile/SettingsScreen")}
                >
                    <FontAwesome5 name={"cog"} size={22} color={icon} />
                </TouchableOpacity>
            </View>

            <ThemedView style={styles.imageContainer}>
                <Image
                    source={require("../../assets/images/perfil.png")}
                    style={styles.image}
                />
                <ThemedText style={[styles.textUserName, { color: text }]}>
                    {profileName}
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.container}>
                <View>
                    {campos.map((campo, index) => (
                        <View key={index}>
                            <ThemedText style={[styles.label, { color: text }]}>
                                {campo.label}
                            </ThemedText>
                            <TextInput
                                value={campo.value}
                                onChangeText={(value) =>
                                    updateField(campo.setter, value)
                                }
                                placeholder={campo.placeholder}
                                style={[
                                    styles.inputProfile,
                                    {
                                        backgroundColor: inputBg,
                                        borderColor: border,
                                        color: text,
                                    },
                                ]}
                            />
                        </View>
                    ))}

                    <ThemedText style={[styles.label, { color: text }]}>
                        Senha
                    </ThemedText>
                    <TouchableOpacity
                        onPress={() =>
                            router.push(
                                `/profile/PasswordUpdate?userId=${user?.uid}`
                            )
                        }
                    >
                        <TextInput
                            placeholder={senhaOculta}
                            editable={false}
                            secureTextEntry={true}
                            pointerEvents="none"
                            placeholderTextColor={useThemeColor(
                                { light: "#666", dark: "#aaa" },
                                "text"
                            )}
                            style={[
                                styles.inputProfile,
                                {
                                    backgroundColor: inputBg,
                                    borderColor: border,
                                    color: text,
                                },
                            ]}
                        />
                    </TouchableOpacity>
                </View>

                <View style={{ width: "60%", alignSelf: "center" }}>
                    <ModernButton
                        text="Salvar Dados"
                        onPress={updateData}
                        icon="save"
                        disabled={!formEdited}
                        colors={
                            !formEdited ? undefined : ["#007bff", "#0056d6"]
                        }
                    />
                </View>

                <Modal
                    transparent={true}
                    visible={loading}
                    animationType="fade"
                >
                    <View style={styles.loadingBackground}>
                        <ActivityIndicator size="large" color="black" />
                    </View>
                </Modal>
            </ThemedView>
        </ThemedView>
    );
}
