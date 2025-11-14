import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Anuncio } from '../models/Anuncio';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FavoriteCardProps {
  anuncio: Anuncio;
  onRemove: (id: string) => void;
}

const FavoriteCard: React.FC<FavoriteCardProps> = ({ anuncio, onRemove }) => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('AnuncioDetail', { anuncioId: anuncio.id })}
    >
      <Image source={{ uri: anuncio.imageUrl }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{anuncio.titulo}</Text>
        <Text style={styles.price}>R$ {anuncio.preco.toLocaleString('pt-BR')}</Text>
      </View>
      <TouchableOpacity onPress={() => onRemove(anuncio.id!)} style={styles.removeButton}>
        <MaterialCommunityIcons name="delete-outline" size={24} color="#E91E63" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
});

export default FavoriteCard;
