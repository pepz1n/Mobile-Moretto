import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { TextInputMask } from 'react-native-masked-text';

const RegisterScreen = () => {
  const router = useRouter();
  const [nomeCompleto, setNomeCompleto] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [cpfCnpj, setCpfCnpj] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [emailError, setEmailError] = React.useState(false);

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
    setEmail(value);
  };

  const toastMostrar = (message, type) => {
    Toast.show({
      type: type,
      position: 'bottom',
      text1: message,
    });
  };

  const handleRegister = async () => {
    try {
      console.log(emailError);
      
      if (!nomeCompleto || !email || !cpfCnpj || !senha || emailError) {
        toastMostrar('Preencha todos os campos!', 'error');
        return;
      }
      const response = await axios.post('http://10.0.2.2:3333/usuario/register', {
        nomeCompleto,
        email,
        cpfCnpj,
        senha,
      });

        router.push('/auth/');
        toastMostrar('Usuário registrado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao fazer registro:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome Completo"
        value={nomeCompleto}
        onChangeText={setNomeCompleto}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
        value={email}
        onChangeText={validateEmail}
      />
      {emailError ? <Text style={styles.errorText}>Formato de email inválido</Text> : null}
      <TextInputMask
        style={styles.input}
        type={'cpf'}
        placeholder="CPF"
        value={cpfCnpj}
        onChangeText={setCpfCnpj}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
      <Button title="Registrar" onPress={handleRegister} />
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
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default RegisterScreen;
