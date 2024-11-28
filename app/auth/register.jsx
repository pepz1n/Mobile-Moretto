import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';

const RegisterScreen = () => {
  const router = useRouter();
  const [nomeCompleto, setNomeCompleto] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [cpfCnpj, setCpfCnpj] = React.useState('');
  const [senha, setSenha] = React.useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://10.0.2.2:3333/usuario/register', {
        nomeCompleto,
        email,
        cpfCnpj,
        senha,
      });

        router.push('/auth/');
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
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="CPF/CNPJ"
        keyboardType="numeric"
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
});

export default RegisterScreen;
