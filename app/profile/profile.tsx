import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppColors } from "@/hooks/use-app-colors";
import { ToastMessage } from "@/utils/ToastMessage";
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
    const COLORS = useAppColors();

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
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error">("success");

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

            setToastMessage("Seus dados foram atualizados!");
            setToastVisible(true);
        } catch (error) {
            console.log(error);
            setToastMessage("Erro ao atualizar dados");
            setToastVisible(true);
            setToastType("error");
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
                    <FontAwesome5 name={"cog"} size={22} color={COLORS.icon} />
                </TouchableOpacity>
            </View>

            <ThemedView style={styles.imageContainer}>
                <Image
                    source={require("../../assets/images/perfil.png")}
                    style={styles.image}
                />
                <ThemedText
                    style={[styles.textUserName, { color: COLORS.text }]}
                >
                    {profileName}
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.container}>
                <View>
                    {campos.map((campo, index) => (
                        <View key={index}>
                            <ThemedText
                                style={[styles.label, { color: COLORS.text }]}
                            >
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
                                        backgroundColor: COLORS.inputBg,
                                        borderColor: COLORS.border,
                                        color: COLORS.text,
                                    },
                                ]}
                            />
                        </View>
                    ))}

                    <ThemedText style={[styles.label, { color: COLORS.text }]}>
                        Senha
                    </ThemedText>
                    <TouchableOpacity
                        onPress={() =>
                            router.push(
                                `/profile/PasswordUpdate?userId=${user?.uid}`,
                            )
                        }
                    >
                        <TextInput
                            placeholder={senhaOculta}
                            editable={false}
                            secureTextEntry={true}
                            pointerEvents="none"
                            placeholderTextColor={COLORS.placeholder}
                            style={[
                                styles.inputProfile,
                                {
                                    backgroundColor: COLORS.inputBg,
                                    borderColor: COLORS.border,
                                    color: COLORS.text,
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

            <ToastMessage
                visible={toastVisible}
                message={toastMessage}
                type={toastType}
                onHide={() => setToastVisible(false)}
            />
        </ThemedView>
    );
}
