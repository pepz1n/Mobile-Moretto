import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { Provider, useSelector } from 'react-redux';

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

  return (
    <View style={styles.container}>
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
});
