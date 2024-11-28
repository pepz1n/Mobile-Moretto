import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { Picker } from '@react-native-picker/picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useFocusEffect } from '@react-navigation/native'
import { FontAwesome } from '@expo/vector-icons'

export default function CrudPromocoes() {
  const [promocoes, setPromocoes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [token, setToken] = useState('')
  const [formData, setFormData] = useState({
    id: null,
    titulo: '',
    descricao: '',
    percentual_desconto: '',
    data_inicio: '',
    data_fim: '',
    id_produto: '',
    preco_com_desconto: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [showInicioPicker, setShowInicioPicker] = useState(false)
  const [showFimPicker, setShowFimPicker] = useState(false)
  const [expandedItems, setExpandedItems] = useState([])

  const toastMostrar = (message, type) => {
    Toast.show({
      type,
      position: 'bottom',
      text1: message,
    })
  }

  const getPromocoes = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:3333/promocoes', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPromocoes(response.data.data)
    } catch (error) {
      console.error(error.message)
    }
  }

  const getProdutos = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:3333/produto', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProdutos(response.data.data)
    } catch (error) {
      console.error(error.message)
    }
  }

  useFocusEffect(
      useCallback(() => {
        const fetchData = async () => {
          const authToken = await AsyncStorage.getItem('authToken')
          if (!authToken) {
            Alert.alert('Erro', 'Usuário não autenticado')
            return
          }
          setToken(authToken)
          await getPromocoes()
          await getProdutos()
        }
        fetchData()
      }, [])
  )

  const handleEdit = (promocao) => {
    setFormData({
      ...promocao,
      data_inicio: promocao.data_inicio.split('T')[0],
      data_fim: promocao.data_fim.split('T')[0],
    })
    setIsEditing(true)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://10.0.2.2:3333/promocoes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toastMostrar('Promoção deletada com sucesso', 'success')
      await getPromocoes()
    } catch (error) {
      console.error(error.message)
      toastMostrar('Erro ao deletar promoção', 'error')
    }
  }

  const handleSubmit = async () => {
    if (
        !formData.titulo.trim() ||
        !formData.descricao.trim() ||
        !formData.percentual_desconto ||
        !formData.data_inicio ||
        !formData.data_fim ||
        !formData.id_produto
    ) {
      Alert.alert('Erro', 'Preencha todos os campos antes de continuar.')
      return
    }

    try {
      const request = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        percentual_desconto: parseFloat(formData.percentual_desconto),
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        id_produto: formData.id_produto,
      }

      if (isEditing) {
        await axios.patch(
            `http://10.0.2.2:3333/promocoes/${formData.id}`,
            request,
            { headers: { Authorization: `Bearer ${token}` } },
        )
        toastMostrar('Promoção atualizada com sucesso', 'success')
      } else {
        await axios.post('http://10.0.2.2:3333/promocoes', request, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toastMostrar('Promoção adicionada com sucesso', 'success')
      }

      setFormData({
        id: null,
        titulo: '',
        descricao: '',
        percentual_desconto: '',
        data_inicio: '',
        data_fim: '',
        id_produto: '',
        preco_com_desconto: '',
      })
      setIsEditing(false)
      await getPromocoes()
    } catch (error) {
      console.error(error.message)
    }
  }

  const toggleExpanded = (id) => {
    setExpandedItems((prevExpanded) =>
        prevExpanded.includes(id)
            ? prevExpanded.filter((itemId) => itemId !== id)
            : [...prevExpanded, id]
    )
  }

  return (
      <View style={styles.container}>
        <Text style={styles.title}>CRUD de Promoções</Text>
        <TextInput
            style={styles.input}
            placeholder="Título"
            value={formData.titulo}
            onChangeText={(text) => setFormData({ ...formData, titulo: text })}
        />
        <TextInput
            style={styles.input}
            placeholder="Descrição"
            value={formData.descricao}
            onChangeText={(text) => setFormData({ ...formData, descricao: text })}
        />
        <TextInput
            style={styles.input}
            placeholder="Desconto (%)"
            keyboardType="numeric"
            value={formData.percentual_desconto}
            onChangeText={(text) =>
                setFormData({ ...formData, percentual_desconto: text })
            }
        />
        <TouchableOpacity onPress={() => setShowInicioPicker(true)}>
          <TextInput
              style={styles.input}
              placeholder="Data Início (YYYY-MM-DD)"
              value={formData.data_inicio}
              editable={false}
          />
        </TouchableOpacity>
        {showInicioPicker && (
            <DateTimePicker
                value={formData.data_inicio ? new Date(formData.data_inicio) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowInicioPicker(false)
                  if (selectedDate) {
                    setFormData({
                      ...formData,
                      data_inicio: selectedDate.toISOString().split('T')[0],
                    })
                  }
                }}
            />
        )}
        <TouchableOpacity onPress={() => setShowFimPicker(true)}>
          <TextInput
              style={styles.input}
              placeholder="Data Fim (YYYY-MM-DD)"
              value={formData.data_fim}
              editable={false}
          />
        </TouchableOpacity>
        {showFimPicker && (
            <DateTimePicker
                value={formData.data_fim ? new Date(formData.data_fim) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowFimPicker(false)
                  if (selectedDate) {
                    setFormData({
                      ...formData,
                      data_fim: selectedDate.toISOString().split('T')[0],
                    })
                  }
                }}
            />
        )}
        <Picker
            selectedValue={formData.id_produto}
            onValueChange={(value) => setFormData({ ...formData, id_produto: value })}
            style={styles.input}
        >
          <Picker.Item label="Selecione um Produto" value="" />
          {produtos.map((produto) => (
              <Picker.Item key={produto.id} label={produto.nome} value={produto.id} />
          ))}
        </Picker>
        <View style={styles.buttonRow}>
          <Button
              title={isEditing ? 'Atualizar Promoção' : 'Adicionar Promoção'}
              onPress={handleSubmit}
          />
        </View>
        <FlatList
            data={promocoes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemText}>{item.titulo}</Text>
                    <TouchableOpacity
                        onPress={() => handleEdit(item)}
                        style={styles.iconButton}
                    >
                      <FontAwesome name="pencil" size={20} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDelete(item.id)}
                        style={styles.iconButton}
                    >
                      <FontAwesome name="trash" size={20} color="#f44336" />
                    </TouchableOpacity>
                  </View>
                  {expandedItems.includes(item.id) && (
                      <View style={styles.detailsContainer}>
                        <Text style={styles.detailsText}>
                          Descrição: {item.descricao}
                        </Text>
                        <Text style={styles.detailsText}>
                          Desconto: {item.percentual_desconto}%
                        </Text>
                        <Text style={styles.detailsText}>
                          Início: {item.data_inicio}
                        </Text>
                        <Text style={styles.detailsText}>
                          Fim: {item.data_fim}
                        </Text>
                      </View>
                  )}
                  <TouchableOpacity
                      onPress={() => toggleExpanded(item.id)}
                      style={styles.expandButton}
                  >
                    <Text style={styles.expandButtonText}>
                      {expandedItems.includes(item.id) ? 'Recolher' : 'Detalhes'}
                    </Text>
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
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
  detailsText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
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
