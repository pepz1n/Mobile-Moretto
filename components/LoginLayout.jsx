import React from 'react';
import { View, StyleSheet } from 'react-native';

const LoginLayout = ({ children }) => {
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Fundo branco ou qualquer cor desejada
  },
});

export default LoginLayout;
