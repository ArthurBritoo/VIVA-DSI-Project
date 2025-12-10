import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useComentarios } from '../contexts/ComentariosContext';
import { Comentario } from '../models/Comentario';

interface ComentariosSectionProps {
  anuncioId: string;
}

export const ComentariosSection: React.FC<ComentariosSectionProps> = ({ anuncioId }) => {
  const { comentarios, loading, loadComentarios, addComentario, deleteComentario } = useComentarios();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComentarios(anuncioId);
  }, [anuncioId]);

  const handleAddComentario = async () => {
    if (!titulo.trim() || !descricao.trim()) {
      Alert.alert('Erro', 'Preencha título e descrição');
      return;
    }

    setIsSubmitting(true);
    try {
      await addComentario(anuncioId, titulo, descricao, rating);
      setTitulo('');
      setDescricao('');
      setRating(5);
      Alert.alert('Sucesso', 'Comentário adicionado!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao adicionar comentário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (comentarioId: string) => {
    Alert.alert('Deletar', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          await deleteComentario(comentarioId);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comentários</Text>

      {/* Form novo comentário */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Título"
          value={titulo}
          onChangeText={setTitulo}
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={4}
        />
        
        <View style={styles.ratingContainer}>
          <Text>Rating: </Text>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text style={{ fontSize: 24, color: star <= rating ? '#FFD700' : '#ccc' }}>★</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleAddComentario}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>{isSubmitting ? 'Enviando...' : 'Adicionar Comentário'}</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de comentários */}
      <FlatList
        data={comentarios}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.comentarioCard}>
            <Text style={styles.comentarioTitulo}>{item.titulo}</Text>
            <Text style={styles.comentarioUser}>{item.userName}</Text>
            <Text style={styles.rating}>{'★'.repeat(item.rating)}</Text>
            <Text style={styles.comentarioDescricao}>{item.descricao}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteButton}>Deletar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? 'Carregando...' : 'Nenhum comentário'}</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, marginVertical: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  form: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 10, borderRadius: 6 },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 6, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  comentarioCard: { backgroundColor: '#fff', padding: 12, marginBottom: 10, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: '#007AFF' },
  comentarioTitulo: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  comentarioUser: { fontSize: 12, color: '#666', marginBottom: 4 },
  rating: { color: '#FFD700', marginBottom: 4 },
  comentarioDescricao: { fontSize: 13, color: '#333', marginBottom: 8 },
  deleteButton: { color: '#FF3B30', fontWeight: 'bold', fontSize: 12 },
  empty: { textAlign: 'center', color: '#999', marginVertical: 20 },
});