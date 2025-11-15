import { useState } from "react"
import { View, ActivityIndicator } from "react-native"
import logIn from "../../services/logIn";
import RegisterModal from "../../components/registerModal";
import PasswordField from "../../utils/Passwordfield";
import styles from "../../styles/loginStyles";
import ModernButton from "../../utils/ModernButton";
import ModernInput from "../../utils/ModernInput";
import { router } from "expo-router";

export default function Login(){

    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [loadingVisible, setLoadingVisible] = useState(false)    

    async function handleLogin() {
        if(!email || !password){
            alert('Preencha todos os campos');
            return;
        }

        try {
            setLoadingVisible(true);
            const resultado = await logIn(email, password);
            setLoadingVisible(false);

            if (resultado) {
                router.replace('/(tabs)');
            } else {
                alert('Usuário ou senha inválidos');
            }
        } catch (error) {
            setLoadingVisible(false);
            console.log(error);
        }
    }

    return(
        <View style={styles.container}>
            {loadingVisible && (
                <View style={styles.viewLoading}>
                    <ActivityIndicator
                        size='large'
                    />
                </View>
            )}
            <View style={styles.viewForm}>                
                <View style={{alignItems: 'center'}}>
                    <ModernInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Digite o email"
                    />
                    <PasswordField
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Digite a senha"
                        style={[styles.inputLoginPassword]}
                    />
                </View>
                <View style={styles.viewButtons}>
                      <ModernButton
                        text="Login"
                        onPress={handleLogin}
                        icon="sign-in-alt"
                      />
                      <ModernButton
                        text="Criar Conta"
                        onPress={() => setModalVisible(true)}
                        icon="user-plus"
                      />
                    </View>
            </View>
            <View>
                <RegisterModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSuccess={() => router.replace('/(tabs)')}
                    styles={styles}
                />
            </View>
        </View>
    )
}
