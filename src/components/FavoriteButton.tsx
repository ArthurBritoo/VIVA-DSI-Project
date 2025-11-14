import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useFavorites } from '../contexts/FavoritesContext';
import { Anuncio } from '../models/Anuncio';

interface FavoriteButtonProps {
  anuncio: Anuncio;
  size?: number;
  style?: object;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ anuncio, size = 24, style }) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const isFav = isFavorite(anuncio.id!);

  const handlePress = () => {
    if (isFav) {
      removeFavorite(anuncio.id!);
    } else {
      addFavorite(anuncio);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.button, style]}>
      <MaterialCommunityIcons
        name={isFav ? 'heart' : 'heart-outline'}
        size={size}
        color={isFav ? '#E91E63' : '#000'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

export default FavoriteButton;
