import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from '../contexts/UserContext';
import { doc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../assets/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { uploadImageToSupabase } from '../services/uploadImageToSupabase';

export default function EditarPerfil() {
  const navigation = useNavigation<any>();
  const { currentUser, setCurrentUser } = useUserContext();

  const [nome, setNome] = useState(currentUser?.nome || '');
  const [telefone, setTelefone] = useState(currentUser?.telefone || '');
  const [foto, setFoto] = useState(currentUser?.foto || '');
  const [editando, setEditando] = useState(false);

  const handleEditar = () => {
    setEditando(true);
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permissão negada', 'É necessário permitir acesso à galeria.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setFoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao escolher imagem:', error);
      Alert.alert('Erro', 'Não foi possível escolher a imagem.');
    }
  };

  const handleSalvar = async () => {
    if (!currentUser) return;

    let fotoUrl = foto;
    // Se a foto foi alterada e é local, faz upload e pega a URL pública
    if (foto && foto.startsWith('file://')) {
      try {
        fotoUrl = await uploadImageToSupabase(foto, `perfil/${currentUser.uid}.jpg`);
      } catch (e: any) {
        Alert.alert('Erro', 'Não foi possível enviar a imagem de perfil.');
        return;
      }
    }

    // Atualize o perfil do usuário no Firestore
    const updates: any = {};
    if (nome !== currentUser.nome) updates.nome = nome;
    if (telefone !== currentUser.telefone) updates.telefone = telefone;
    if (fotoUrl !== currentUser.foto) updates.foto = fotoUrl;

    await updateDoc(doc(db, 'users', currentUser.uid), updates);

    setCurrentUser({ ...currentUser, ...updates });
    Alert.alert('Sucesso', 'Perfil atualizado!');
    setEditando(false);
  };

  const handleExcluir = async () => {
    if (!currentUser) return;
    Alert.alert(
      'Excluir conta',
      'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', currentUser.uid));
              await auth.currentUser?.delete();
              setCurrentUser(null);
              Alert.alert('Conta excluída');
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch (error: any) {
              console.error('Erro ao excluir conta:', error);
              Alert.alert('Erro', `Não foi possível excluir a conta: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      {editando ? (
        <TouchableOpacity onPress={handlePickImage} style={styles.imagePickerContainer}>
          {foto ? (
            <Image source={{ uri: foto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="camera-plus" size={40} color="#ccc" />
              <Text style={styles.avatarPlaceholderText}>Adicionar Foto</Text>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <>
          {foto ? (
            <Image source={{ uri: foto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>Sem Foto</Text>
            </View>
          )}
        </>
      )}

      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={[styles.input, !editando && styles.inputDisabled]}
        value={nome}
        onChangeText={setNome}
        editable={editando}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, styles.inputDisabled]}
        value={currentUser?.email || ''}
        editable={false}
      />

      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={[styles.input, !editando && styles.inputDisabled]}
        value={telefone}
        onChangeText={setTelefone}
        editable={editando}
        keyboardType="phone-pad"
      />

      {!editando ? (
        <TouchableOpacity style={styles.editButton} onPress={handleEditar}>
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.deleteButton} onPress={handleExcluir}>
        <Text style={styles.deleteButtonText}>Excluir Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  imagePickerContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginBottom: 24 },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  avatarPlaceholderText: { color: '#888', fontSize: 14, marginTop: 8 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  inputDisabled: { backgroundColor: '#f5f5f5', color: '#888' },
  editButton: { backgroundColor: '#137fec', padding: 16, borderRadius: 8, marginBottom: 16 },
  editButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#28a745', padding: 16, borderRadius: 8, marginBottom: 16 },
  saveButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  deleteButton: { backgroundColor: '#ff4444', padding: 16, borderRadius: 8 },
  deleteButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
