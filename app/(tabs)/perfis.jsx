import axios from 'axios';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Toast from 'react-native-toast-message';

export default function CrudScreen() {
  const [items, setItems] = useState([]);
  const [token, setToken] = useState([]);
  const [input, setInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const toastMostrar = (message, type) => {
    Toast.show({
      type: type, 
      position: 'bottom',
      text1: message,
      
    });
  };

  const getItems = async () => {
    try {
      const dados = await axios.get('http://10.0.2.2:3333/perfil', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      setItems(dados.data.data);
      console.log(items);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getItems();
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/auth'); 
        setIsAuth(false);
        return;
      }
      setToken(token); 
    };
    fetchData();
  }, []);

  const addItem = async () => {
    if (input.trim() === '') {
      Alert.alert('Erro', 'O campo de nome não pode estar vazio');
      return;
    }
    const request = {
      nomePerfil: input
    }
    await axios.post('http://10.0.2.2:3333/perfil', request, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    toastMostrar('Item adicionado com sucesso', 'success');
    await getItems();
  };

  const editItem = (id) => {
    const itemToEdit = items.find(item => item.id === id);
    if (itemToEdit) {
      setInput(itemToEdit.nomePerfil);
      setEditId(id);
      setIsEditing(true);
    }
  };

  const updateItem = async () => {
    if (!editId) return;

    const request = {
      nomePerfil: input
    }

    await axios.patch(`http://10.0.2.2:3333/perfil/${editId}`, request, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    await getItems();

    setInput('');
    setIsEditing(false);
    setEditId(null);
    toastMostrar('Item editado com sucesso', 'success');
  };

  const deleteItem = async (id) => {
    await axios.delete(`http://10.0.2.2:3333/perfil/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    await getItems();
    toastMostrar('Item deletado com sucesso', 'success');
  };

  const handleAddOrUpdate = () => {
    if (isEditing) {
      updateItem();
    } else {
      addItem();
    }
  };

  const pararEdit = () => {
    setInput('');
    setIsEditing(false);
    setEditId(null);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRUD de Perfis</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do Perfil"
        value={input}
        onChangeText={setInput}
      />
      {!isEditing && (
        <Button
          style={isEditing ? styles.tamanhoBotaoSalvar : null}
          title={isEditing ? 'Atualizar Item' : 'Adicionar Item'}
          onPress={handleAddOrUpdate}
        />
      )}
      <View style={isEditing ? styles.ContainerCoiso: null}>
        <View style={isEditing ? styles.buttonRow : null}>
        <View style={styles.buttonSalvarContainer}>
            <Button
              style={styles.tamanhoBotaoSalvar}
              title={'Atualizar Item'}
              onPress={handleAddOrUpdate}
            />
          </View>
          {isEditing && (
            <View style={styles.buttonExcluirContainer}>
              <Button
                style={styles.botaoParar}
                title='Parar'
                onPress={pararEdit}
              />
            </View>
          )}
        </View>
      </View>
      <FlatList
        data={items}
        style={styles.margemTop}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.nomePerfil}</Text>
            <TouchableOpacity onPress={() => editItem(item.id)} style={styles.editButton}>
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteButton}>
              <Text style={styles.buttonText}>Deletar</Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separador} />}  
      />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  separador: {
    height: 1, 
    backgroundColor: '#ddd', 
    marginLeft: 10,  
  },
  ContainerCoiso: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%', 
  },
  buttonSalvarContainer: {
    flex: 3, 
    marginRight: 10,
  },
  buttonExcluirContainer: {
    flex: 1,
  },
  tamanhoBotaoSalvar: {
    width: '100%',
  },
  botaoParar: {
    width: '100%',
    backgroundColor: '#f44336',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 18,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 5,
    borderRadius: 5,
    position: 'absolute',
    top: 10,
    right: 70,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 5,
    borderRadius: 5,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  buttonText: {
    color: '#fff',
  },
});
