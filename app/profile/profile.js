import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import { signOut, updateEmail } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../lib/firebase";
import { deleteUserAccount } from "../../services/deleteUser";
import ModernButton from "../../utils/ModernButton";
import PasswordConfirmationModal from "./components/PasswordConfirmationModal";
import styles from "./styles/styles";

export default function Perfil(){
    const inputBg = useThemeColor({light: "#f5f5f5", dark: "#1a1a1a"}, "background");
    const border = useThemeColor({ light: "#ccc", dark: "#444" }, "border");
    const text = useThemeColor({ light: "#333", dark: "#eee" }, "text");

    const user = auth.currentUser;

    const [originalData, setOriginalData] = useState({});
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [profileName, setProfileName] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const [loading, setLoading] = useState(false);

    const [fakeLength, setFakeLength] = useState("");
    const senhaOculta = "●".repeat(fakeLength);

    useEffect(() => {
        const size = generateFakePasswordLength();
        setFakeLength(size);
    }, []);

    useEffect(() => {
        async function loadUserData() {
            if (!user.uid) return;

            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setOriginalData(data);
                    setName(data.name || '');
                    setProfileName(data.name || '');
                }

                setEmail(user.email || '');
                
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
            }
        }

        loadUserData();
    }, [user]);

    function generateFakePasswordLength(min = 6, max = 17) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    async function updateData() {

        if (!user.uid){
            Alert.alert('Erro', 'Usuário não encontrado');
            return;
        }

        const dadosAtualizados = {};
        if (name !== originalData.name) dadosAtualizados.name = name;

        const emailChanged = email !== user.email;

        if (Object.keys(dadosAtualizados).length === 0 && emailChanged){
            Alert.alert('Aviso', 'Nenhum dado foi alterado.');
            return;
        }

        try {
            setLoading(true);

            if(emailChanged) await updateEmail(user, email);

            if (Object.keys(dadosAtualizados).length > 0) await updateDoc(doc(db, 'users', user.uid), dadosAtualizados);

            Alert.alert('Sucesso', 'Dados atualizados!');
            router.back();
        } catch (error) {
            console.log(error);
            Alert.alert('Erro', 'Não foi possível atualizar os dados.');
        } finally {
            setLoading(false);
        }
    }

    async function logOut(){
        await signOut(auth);
        router.replace('/Home');
    }

    async function handleDeleteUser() {
        await deleteUserAccount(
            {user,
            confirmPassword,
            setDeleting,
            setDeleteError,
            setShowDeleteModal,
            setConfirmPassword}
        );
    }

    const campos = [
        { label: 'Nome', value: name, setter: setName, placeholder: 'Digite seu nome' },
        { label: 'Email', value: email, setter: setEmail, placeholder: 'Digite seu email' },
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
        <ThemedView style={{flex:1, marginTop: 30}}>
            <ThemedView style={styles.imageContainer}>
                <Image source={require('../../assets/images/perfil.png')} style={styles.image} />
                <ThemedText style={[styles.textUserName, {color: text}]}>{profileName}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.container}>
                <View>
                    {campos.map((campo, index) => (
                        <View key={index}>
                            <ThemedText style={[styles.label, {color: text}]}>{campo.label}</ThemedText>
                            <TextInput
                                value={campo.value}
                                onChangeText={campo.setter}
                                placeholder={campo.placeholder}
                                style={[styles.inputProfile,
                                    {
                                        backgroundColor: inputBg,
                                        borderColor: border,
                                        color: text
                                    }
                                ]}
                            />
                        </View>
                    ))}

                    <ThemedText style={[styles.label, {color: text}]}>{'Senha'}</ThemedText>
                    <TouchableOpacity
                        onPress={() => router.push(`/profile/PasswordUpdate?userId=${user.uid}`)}
                    >
                        <TextInput
                            placeholder={senhaOculta}
                            editable={false}
                            secureTextEntry={true}
                            pointerEvents="none"
                            placeholderTextColor={useThemeColor({light:"#666", dark:"#aaa"}, "text")}
                            style={[
                                styles.inputProfile,
                                {
                                    backgroundColor: inputBg,
                                    borderColor: border,
                                    color: text
                                }
                            ]}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.footContainer}>
                    <ModernButton
                        text="Salvar Dados"
                        onPress={updateData}
                        icon="save"
                    />
                    <ModernButton
                        text="Excluir Conta"
                        onPress={() => setShowDeleteModal(true)}
                        icon="trash-alt"
                        colors={["#D30000","#FF2800"]}
                    />
                </View>
                <View style={{width: '50%', alignSelf: 'center'}}>
                    <ModernButton
                        text="Sair"
                        onPress={logOut}
                        icon="sign-out-alt"
                        colors={["#D30000","#FF2800"]}
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
                <PasswordConfirmationModal
                    visible={showDeleteModal}
                    password={confirmPassword}
                    onChangePassword={setConfirmPassword}
                    onCancel={()=>{
                        setShowDeleteModal(false);
                        setConfirmPassword('');
                        setDeleteError('');
                    }}
                    onConfirm={handleDeleteUser}
                    loading={deleting}
                    errorMessage={deleteError}
                />
            </ThemedView>
        </ThemedView>
    );
}