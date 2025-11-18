import { TextInput, Text, View, TouchableOpacity, Alert, ActivityIndicator, Modal, Image } from "react-native";
import { db } from "../../lib/firebase";
import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./styles/styles";
import PasswordConfirmationModal from "./components/PasswordConfirmationModal";
import { getUser } from '../../services/getUser';
import ModernButton from "../../utils/ModernButton";
import { router } from "expo-router";

export default function Perfil(){
    const [originalData, setOriginalData] = useState({});
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');    
    const [name, setName] = useState('');
    const [userId, setUserId] = useState('');    
    const [profileName, setProfileName] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const [loading, setLoading] = useState(false);

    const senhaOculta = "●".repeat(password.length);

    useEffect(()=>{
        getUser(setUserId);
    }, []);

    useEffect(() => {
        async function loadUserData() {
            if (!userId) return;
            
            try {
                const userRef = doc(db, 'users', userId);
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setOriginalData(data);
                    setPassword(data.password || '');
                    setEmail(data.email || '');
                    setName(data.name || '');
                    setProfileName(data.name || '');
                }
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
            }
        }

        loadUserData();
    }, [userId]);

    async function updateData() {

        if(!userId){
            Alert.alert('Erro', 'Usuário não encontrado');
            return;
        }

        const dadosAtualizados = {};
        if (name !== originalData.name) dadosAtualizados.name = name;
        if (email !== originalData.email) dadosAtualizados.email = email;

        if (Object.keys(dadosAtualizados).length === 0){
            Alert.alert('Aviso', 'Nenhum dado foi alterado.');
            return;
        }

        try {
            setLoading(true);
            await updateDoc(doc(db, 'users', userId), dadosAtualizados);
            Alert.alert('Sucesso', 'Dados atualizados!');
            router.back();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar os dados.');
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    async function logOut(){
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('password');
      router.replace('/Home');
  }

    async function excluirUser() {
        if(!userId){
            Alert.alert('Erro', 'Usuário não encontrado');
            return;
        }
        if (!confirmPassword){
            Alert.alert('Erro', 'Digite sua senha para continuar.');
            return;
        }

        try {
            setDeleting(true);
            setDeleteError('');

            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
                setDeleteError('Usuário não encontrado.');
                return;
            }

            if (confirmPassword !== originalData.password) {
                setDeleteError('Senha incorreta.');
                return;
            }
            
            await deleteDoc(userRef);
            Alert.alert('Sucesso', 'Conta ecluída com sucesso!');
            
            setShowDeleteModal(false);
            setConfirmPassword('');
            await AsyncStorage.removeItem('usuario');
            navigation.reset({
                index: 0,
                routes: [{name: 'Login'}]
            });
        } catch (error){
            setDeleteError('Erro inesperado ao excluir a conta.'); 
            console.log(error);
        } finally {
            setDeleting(false);
        }
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
        <View style={{flex:1, marginTop: 30}}>
            <View style={styles.imageContainer}>
                <Image source={require('../../assets/images/perfil.png')} style={styles.image} />
                <View>
                    <Text style={styles.textUserName}>{profileName}</Text>
                </View>
            </View>
            <View style={styles.container}>
                <View>
                    {campos.map((campo, index) => (
                        <View key={index}>
                            <Text style={styles.label}>{campo.label}</Text>
                            <TextInput
                                value={campo.value}
                                onChangeText={campo.setter}
                                placeholder={campo.placeholder}
                                placeholderTextColor="#666"
                                style={styles.inputProfile}
                            />
                        </View>
                    ))}

                    <Text style={styles.label}>{'Senha'}</Text>
                    <TouchableOpacity
                        onPress={() => router.push(`/profile/PasswordUpdate?userId=${userId}`)}
                    >
                        <TextInput
                            placeholder={senhaOculta}
                            editable={false}
                            secureTextEntry={true}
                            pointerEvents="none"
                            placeholderTextColor="#666"
                            style={styles.inputProfile}
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
                    onConfirm={excluirUser}
                    loading={deleting}
                    errorMessage={deleteError}
                />
            </View>
        </View>
    );
}