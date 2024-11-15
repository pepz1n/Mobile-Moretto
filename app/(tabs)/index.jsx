import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function CrudScreen() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Função que será chamada ao abrir a tela
  const getItems = async () => {
    try {
      const dados = await axios.get('http://10.0.2.2:3333/perfil')
      setItems(dados.data.data);
      console.log(items);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getItems();
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
    await axios.post('http://10.0.2.2:3333/perfil', request);
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

    await axios.patch(`http://10.0.2.2:3333/perfil/${editId}`, request);
    await getItems();

    setInput('');
    setIsEditing(false);
    setEditId(null);
  };

  const deleteItem = async (id) => {
    await axios.delete(`http://10.0.2.2:3333/perfil/${id}`);
    await getItems();
  };

  const handleAddOrUpdate = () => {
    if (isEditing) {
      updateItem();
    } else {
      addItem();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRUD de Perfis</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do Perfil"
        value={input}
        onChangeText={setInput}
      />
      <Button title={isEditing ? 'Atualizar Item' : 'Adicionar Item'} onPress={handleAddOrUpdate} />

      <FlatList
        data={items}
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
});
