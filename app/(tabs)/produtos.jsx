import axios from 'axios'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import Toast from 'react-native-toast-message'
import { FontAwesome } from '@expo/vector-icons'

export default function CrudScreen() {
  const [items, setItems] = useState([])
  const [token, setToken] = useState('')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [preco, setPreco] = useState('')
  const [isEditing, setIsEditing] = useState(false) 
  const [editId, setEditId] = useState(null)

  const toastMostrar = (message, type) => {
    Toast.show({
      type,
      position: 'bottom',
      text1: message,
    })
  }

  const getItems = async (storedToken) => {
    try {
      const dados = await axios.get('http://10.0.2.2:3333/produto', {
        headers: {
          Authorization: `Bearer ${storedToken || token}`,
        },
      })
      setItems(dados.data.data.map((item) => ({ ...item, expanded: false })))
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const storedToken = await AsyncStorage.getItem('authToken')
      if (!storedToken) return
      setToken(storedToken)
      await getItems(storedToken)
    }
    fetchData()
  }, [])

  const addItem = async () => {
    if (!nome.trim() || !descricao.trim() || !preco.trim()) {
      toastMostrar('Todos os campos são obrigatórios', 'error')
      return
    }
    const request = { nome, descricao, preco }
    try {
      await axios.post('http://10.0.2.2:3333/produto', request, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      toastMostrar('Produto adicionado com sucesso', 'success')
      await getItems()
      setNome('')
      setDescricao('')
      setPreco('')
    } catch (error) {
      if (error.response) {
        toastMostrar(error.response.data.message || 'Erro ao adicionar produto', 'error')
      } else if (error.request) {
        toastMostrar('Sem resposta do servidor. Verifique a conexão.', 'error')
      } else {
        toastMostrar('Erro desconhecido. Verifique os logs.', 'error')
      }
    }
  }

  const editItem = (id) => {
    const itemToEdit = items.find((item) => item.id === id)
    if (itemToEdit) {
      setNome(itemToEdit.nome)
      setDescricao(itemToEdit.descricao)
      setPreco(itemToEdit.preco)
      setEditId(id)
      setIsEditing(true)
    }
  }

  const updateItem = async () => {
    if (!editId) return
    const request = { nome, descricao, preco }
    try {
      await axios.patch(`http://10.0.2.2:3333/produto/${editId}`, request, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      await getItems()
      setNome('')
      setDescricao('')
      setPreco('')
      setIsEditing(false)
      setEditId(null)
      toastMostrar('Produto atualizado com sucesso', 'success')
    } catch (error) {
      console.log(error.message)
      toastMostrar('Erro ao atualizar produto', 'error')
    }
  }

  const deleteItem = async (id) => {
    try {
      await axios.delete(`http://10.0.2.2:3333/produto/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      await getItems()
      toastMostrar('Produto deletado com sucesso', 'success')
    } catch (error) {
      console.log(error.message)
      toastMostrar('Erro ao deletar produto', 'error')
    }
  }

  const handleAddOrUpdate = () => {
    if (isEditing) {
      updateItem()
    } else {
      addItem()
    }
  }

  const pararEdit = () => {
    setNome('')
    setDescricao('')
    setPreco('')
    setIsEditing(false)
    setEditId(null)
  }

  const toggleExpanded = (index) => {
    const updatedItems = [...items]
    updatedItems[index].expanded = !updatedItems[index].expanded
    setItems(updatedItems)
  }

  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRUD de Produtos</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do Produto"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição"
        value={descricao}
        onChangeText={setDescricao}
      />
      <TextInput
        style={styles.input}
        placeholder="Preço"
        value={preco}
        onChangeText={setPreco}
        keyboardType="numeric"
      />
      <Button
        title={isEditing ? 'Atualizar Produto' : 'Adicionar Produto'}
        onPress={handleAddOrUpdate}
      />
      {isEditing && (
        <Button
          title="Cancelar Edição"
          onPress={pararEdit}
          color="#f44336"
        />
      )}
      <FlatList
        data={items}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemText}>Nome: {item.nome}</Text>
              <Text style={styles.itemText}>Preço: {formatPrice(item.preco)}</Text>
              <TouchableOpacity onPress={() => editItem(item.id)} style={styles.iconButton}>
                <FontAwesome name="pencil" size={20} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.iconButton}>
                <FontAwesome name="trash" size={20} color="#f44336" />
              </TouchableOpacity>
            </View>
            {item.expanded && (
              <View style={styles.detailsContainer}>
                <Text style={styles.descriptionText}>Descrição: {item.descricao}</Text>
                <Text style={styles.detailsText}>Criado em: {item.created_at}</Text>
                <Text style={styles.detailsText}>Atualizado em: {item.updated_at}</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => toggleExpanded(index)} style={styles.expandButton}>
              <Text style={styles.expandButtonText}>{item.expanded ? 'Recolher' : 'Detalhes'}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Toast />
    </View>
  )
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
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 16,
    flex: 1,
  },
  iconButton: {
    marginLeft: 10,
  },
  detailsContainer: {
    marginTop: 10,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  detailsText: {
    fontSize: 12,
    color: '#666',
  },
  expandButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  expandButtonText: {
    fontSize: 14,
    color: '#000',
  },
})
