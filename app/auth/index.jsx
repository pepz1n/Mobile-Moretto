import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const toastMostrar = (message, type) => {
    Toast.show({
      type: type,
      position: 'bottom',
      text1: message,
    });
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        toastMostrar('Preencha todos os campos!', 'error');
        return;
      }
      const response = await axios.post('http://10.0.2.2:3333/usuario/login', {
        email,
        senha: password,
      });
      
      const token = response.data.data;
      await AsyncStorage.setItem('authToken', token);
      if (token) {
        router.push('/(inicio)'); 
      }
    } catch (error) {
      toastMostrar('Erro ao fazer login!', 'error');
    }
  };

  const navigateToRegister = () => {
    router.push('/auth/register'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Entrar" onPress={handleLogin} />
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Não tem uma conta?</Text>
        <Button title="Registrar" onPress={navigateToRegister} />
      </View>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  registerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default LoginScreen;
