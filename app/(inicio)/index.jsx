import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import store from '../../constants/store';
import { useColorScheme } from '@/hooks/useColorScheme';
import { setUser } from '../../constants/store'; 

function TabLayoutWithStore() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const [isAuth, setIsAuth] = useState(false);
  const [user, setUserState] = useState({ id: 0, name: '' });
  const [loading, setLoading] = useState(true);

  const getStatusUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        router.replace('/auth'); 
        setIsAuth(false);
        return;
      }

      const response = await axios.get('http://10.0.2.2:3333/usuario/get-info-by-token', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = response.data.data;

      dispatch(setUser({ id: dados.id, name: dados.nomeCompleto.split(' ')[0] }));
      setUserState({ id: dados.id, name: dados.nomeCompleto.split(' ')[0] });

      if (dados.id && dados.nomeCompleto) {
        setIsAuth(true);
        router.replace('/(tabs)'); 
      }
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error.message);
      router.push('/auth'); 
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStatusUser();
  }, []); 

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isAuth ? (
        <Text style={styles.text}>Bem-vindo, {user.name}!</Text>
      ) : (
        <Text style={styles.text}>Você não está autenticado.</Text>
      )}
    </View>
  );
}

export default function AppWrapper() {
  return (
    <Provider store={store}>
      <TabLayoutWithStore />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
