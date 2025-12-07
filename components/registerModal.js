import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';
import createUser from '../services/createUser';
import ModernButton from "../utils/ModernButton";
import ModernInput from "../utils/ModernInput";
import PasswordField from "../utils/Passwordfield";

export default function RegisterModal({ visible, onClose, onSuccess, styles }) {
  const [user, setUser] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repPassword, setRepPassword] = useState('');
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [repSenhaError, setRepSenhaError] = useState(null);

  function resetFields() {
    setUser('');
    setEmail('');
    setPassword('');
    setRepPassword('');
  }

  async function handleRegister() {
    setPasswordError(null);
    setRepSenhaError(null);
    if (!user || !email || !password || !repPassword) {
      alert('Preencha todos os campos!');
      return;
    }
    if (password.length < 6){
      setPasswordError('A senha deve ter pelo menos 6 caracteres')
      return
    }
    if (password !== repPassword) {
      setRepSenhaError('As senhas não coincidem!');
      return;
    }

    try {
      setLoadingVisible(true);
      
      const uid = await createUser(user, email, password);
      
      await AsyncStorage.setItem('user', uid);
      
      resetFields();

      if (uid) {
        alert('Usuário criado')
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao criar usuário');
    } finally {
      setLoadingVisible(false);
    }
  }

  return (
    <Modal visible={visible} animationType="fade">
      <View style={styles.container}>
        {loadingVisible && (
          <View style={styles.viewLoading}>
            <ActivityIndicator size="large" />
          </View>
        )}
          <View style={styles.viewForm}>
            <View style={{alignItems: 'center'}}>
              <ModernInput
                value={user}
                onChangeText={setUser}
                placeholder="Digite seu nome"
              />
              <ModernInput
                value={email}
                onChangeText={setEmail}
                placeholder="Digite o e-mail"
                keyboardType="email-address"
              />
              <PasswordField
                value={password}
                onChangeText={setPassword}
                placeholder="Digite a senha"
                style={[styles.inputLoginPassword]}
                errorMessage={passwordError}
              />
              <PasswordField
                value={repPassword}
                onChangeText={setRepPassword}
                placeholder="Digite a senha novamente"
                style={[styles.inputLoginPassword]}
                errorMessage={repSenhaError}
              />
            </View>
            <View style={styles.viewButtons}>
              <ModernButton
                text="Cadastrar"
                onPress={handleRegister}
              />
              <ModernButton
                text="Voltar"
                onPress={() => { resetFields(); onClose(); }}
                icon="backspace"
                colors={["#CF2502","#F4320B"]}
              />
            </View>
          
        </View>
      </View>
    </Modal>
  );
}
