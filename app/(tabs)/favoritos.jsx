import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
    View,
    Text,
    Button,
    FlatList,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from 'react-native'   
import Toast from 'react-native-toast-message'
import { Picker } from '@react-native-picker/picker'


export default function CrudFavoritos() {
    const [favoritos, setFavoritos] = useState([])
    const [produtos, setProdutos] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [token, setToken] = useState('')
    const [idUsuarioSelect, setIdUsuarioSelect] = useState('')
    const [idProdutoSelect, setIdProdutoSelect] = useState('')
    const [formData, setFormData] = useState({ id: null, id_usuario: '', id_produto: '' })
    const [isEditing, setIsEditing] = useState(false)

    const toastMostrar = (message, type) => {
        Toast.show({
            type,
            position: 'bottom',
            text1: message,
        })
    }

    const fetchData = useCallback(async () => {
        const authToken = await AsyncStorage.getItem('authToken')
        if (!authToken) {
            Alert.alert('Erro', 'Usuário não autenticado')
            return
        }
        setToken(authToken)
        try {
            const responseUsuarios = await axios.get('http://10.0.2.2:3333/usuario', {
                headers: { Authorization: `Bearer ${authToken}` },
            })
            setUsuarios(responseUsuarios.data.data)

            const responseProdutos = await axios.get('http://10.0.2.2:3333/produto', {
                headers: { Authorization: `Bearer ${authToken}` },
            })
            setProdutos(responseProdutos.data.data)

            const responseFavoritos = await axios.get('http://10.0.2.2:3333/favoritos', {
                headers: { Authorization: `Bearer ${authToken}` },
            })
            setFavoritos(responseFavoritos.data.data)
        } catch (error) {
            console.error(error.message)
            toastMostrar('Erro ao carregar dados', 'error')
        }
    }, [])
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://10.0.2.2:3333/favoritos/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            toastMostrar('Favorito deletado com sucesso', 'success')
            fetchData()
        } catch (error) {
            console.error(error.message)
            toastMostrar('Erro ao deletar favorito', 'error')
        }
    }

    const handleEdit = (favorito) => {
        setIdProdutoSelect(favorito.idProduto)
        setIdUsuarioSelect(favorito.idUsuario)
        setFormData({ id: favorito.id, id_usuario: favorito.idUsuario, id_produto: favorito.idProduto })
        setIsEditing(true)
    }

    const handleSubmit = async () => {
        const { id_usuario, id_produto } = formData

        if (!idUsuarioSelect || !idProdutoSelect) {
            Alert.alert('Erro', 'Preencha todos os campos antes de continuar.')
            return
        }

        try {
            const request = { idUsuario: idUsuarioSelect, idProduto: idProdutoSelect }

            const url = isEditing
                ? `http://10.0.2.2:3333/favoritos/${formData.id}`
                : 'http://10.0.2.2:3333/favoritos'
            const method = isEditing ? 'patch' : 'post'
            await axios[method](url, request, {
                headers: { Authorization: `Bearer ${token}` },
            })

            toastMostrar(isEditing ? 'Favorito atualizado' : 'Favorito adicionado', 'success')

            setFormData({ id: null, id_usuario: '', id_produto: '' })
            setIsEditing(false)
            fetchData()
        } catch (error) {
            console.error(error.message)
            toastMostrar('Erro ao salvar favorito', 'error')
        }
    }

    useEffect(() => {
        const oi = async () => {
          const token = await AsyncStorage.getItem('authToken');
          await fetchData();
          if (!token) {
            router.replace('/auth'); 
            setIsAuth(false);
            return;
          }
          
          setToken(token); 
        };
        oi();
      }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>CRUD de Favoritos</Text>

            <Picker
                selectedValue={idProdutoSelect}
                onValueChange={(value) => setIdProdutoSelect(value)}
                style={styles.input}
            >
                <Picker.Item label="Selecione um Produto" value="" />
                {produtos.map((produto) => (
                    <Picker.Item key={produto.id} label={produto.nome} value={produto.id} />
                ))}
            </Picker>

            <Picker
                selectedValue={idUsuarioSelect}
                onValueChange={(value) => setIdUsuarioSelect(value)}
                style={styles.input}
            >
                <Picker.Item label="Selecione um Usuário" value="" />
                {usuarios.map((usuario) => (
                    <Picker.Item key={usuario.id} label={usuario.nomeCompleto} value={usuario.id} />
                ))}
            </Picker>

            <View style={styles.buttonRow}>
                <Button
                    title={isEditing ? 'Atualizar Favorito' : 'Adicionar Favorito'}
                    onPress={handleSubmit}
                />
            </View>

            <FlatList
                data={favoritos}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Text style={styles.itemText}>{item.nomeUsuario}</Text>
                        <Text style={styles.itemText}>{item.nomeProduto}</Text>
                        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
                            <Text style={styles.buttonText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                            <Text style={styles.buttonText}>Deletar</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    itemText: {
        fontSize: 16,
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
    separator: {
        height: 1,
        backgroundColor: '#eee',
    },
})
