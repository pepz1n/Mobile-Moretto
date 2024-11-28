import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider, useSelector } from 'react-redux';
import { router } from 'expo-router';

export default function CrudScreen() {
  const [isAuth, setIsAuth] = useState(true);
  const user = useSelector((state) => state.user);
  
  const toastMostrar = (message, type) => {
    Toast.show({
      type: type,
      position: 'bottom',
      text1: message,
    });
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    router.push('/auth');
  }

  return (
    <View style={styles.container}>
        <Button
          style={styles.tamanhoBotaoSalvar}
          title={`Logout`}
          onPress={logout}
        />
      {isAuth && toastMostrar(`Bem Vindo ${user.name}!`, 'success')}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  tamanhoBotaoSalvar: {
    width: '100%',
  },
});
