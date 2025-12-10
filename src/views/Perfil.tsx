import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserContext } from '../contexts/UserContext';
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { useFavorites } from '../contexts/FavoritesContext';
import FavoriteCard from '../components/FavoriteCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Anuncio } from '../models/Anuncio';

type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Home: undefined;
  Buscar: undefined;
  Perfil: undefined;
  RedefinirSenha: undefined;
  EditarPerfil: undefined;
};

export default function Perfil() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentUser, setCurrentUser } = useUserContext();
<<<<<<< HEAD
  const { favorites, removeFavorite, setFavoritesOrder, loading, reloadFavorites } = useFavorites();
  const [isReordering, setIsReordering] = useState(false);
  const [localFavorites, setLocalFavorites] = useState<Anuncio[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log("Perfil: Favorites updated, count:", favorites.length);
    setLocalFavorites(favorites);
  }, [favorites]);

  useFocusEffect(
    React.useCallback(() => {
      console.log("Perfil: Screen focused, reloading favorites");
=======
  const { favorites, removeFavorite, loading, reloadFavorites } = useFavorites();

  useFocusEffect(
    React.useCallback(() => {
>>>>>>> cf9c1f2cecfc6cf5c9e3428ba82ae12755536cdb
      reloadFavorites();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, sair", 
          onPress: () => {
            console.log("Perfil: User logged out");
            setCurrentUser(null);
            navigation.navigate('Login');
          },
          style: 'destructive'
        }
      ]
    );
  };

  const confirmRemove = (id: string) => {
    Alert.alert(
      "Remover Favorito",
      "Tem certeza que deseja remover este imóvel dos seus favoritos?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, remover", 
          onPress: async () => {
            console.log("Perfil: Removing favorite:", id);
            await removeFavorite(id);
            // Atualiza localFavorites imediatamente para evitar inconsistência visual
            setLocalFavorites(prev => prev.filter(fav => fav.id !== id));
          }, 
          style: 'destructive' 
        }
      ]
    );
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localFavorites.length) return;

    console.log(`Perfil: Moving item from ${index} to ${newIndex}`);
    const newFavorites = [...localFavorites];
    const [movedItem] = newFavorites.splice(index, 1);
    newFavorites.splice(newIndex, 0, movedItem);
    setLocalFavorites(newFavorites);
  };

  const saveOrder = async () => {
    console.log("Perfil: Saving favorites order");
    setIsSaving(true);
    try {
      await setFavoritesOrder(localFavorites);
      setIsReordering(false);
      Alert.alert("Sucesso", "Ordem dos favoritos atualizada!");
    } catch (error) {
      console.error("Perfil: Error saving order:", error);
      Alert.alert("Erro", "Não foi possível salvar a ordem. Tente novamente.");
      // Reverte para a ordem original em caso de erro
      setLocalFavorites(favorites);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelReorder = () => {
    console.log("Perfil: Cancelling reorder");
    setLocalFavorites(favorites);
    setIsReordering(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Perfil" onMenuPress={() => {}} />
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.main}>
              <View style={styles.profileSection}>
                {currentUser?.foto ? (
                  <Image source={{ uri: currentUser.foto }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#fff', fontSize: 40 }}>?</Text>
                  </View>
                )}
                <Text style={styles.nameText}>{currentUser ? currentUser.nome : 'Usuário'}</Text>
                <TouchableOpacity
                  style={styles.editProfileButton}
                  onPress={() => navigation.navigate('EditarPerfil')}
                >
                  <Text style={styles.editProfileButtonText}>Editar Perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Text style={styles.logoutButtonText}>Sair</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.favoritesSection}>
              <View style={styles.favoritesHeader}>
                <Text style={styles.sectionTitle}>Meus Favoritos ({localFavorites.length})</Text>
                {!isReordering && favorites.length > 1 && (
                  <TouchableOpacity onPress={() => setIsReordering(true)} style={styles.reorderButtonHeader}>
                    <MaterialCommunityIcons name="swap-vertical" size={24} color="#137fec" />
                    <Text style={styles.reorderButtonText}>Reordenar</Text>
                  </TouchableOpacity>
                )}
              </View>
              {isReordering && (
                <View style={styles.reorderActions}>
                  <TouchableOpacity 
                    onPress={saveOrder} 
                    style={[styles.actionButton, styles.saveButton]}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.actionButtonText}>Salvar Ordem</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={cancelReorder} 
                    style={[styles.actionButton, styles.cancelButton]}
                    disabled={isSaving}
                  >
                    <Text style={styles.actionButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        }
        data={localFavorites}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.favoriteCardContainer}>
            {isReordering && (
              <View style={styles.reorderControls}>
                <TouchableOpacity
                  onPress={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  style={[styles.reorderButton, index === 0 && styles.reorderButtonDisabled]}
                >
                  <MaterialCommunityIcons 
                    name="chevron-up" 
                    size={28} 
                    color={index === 0 ? '#ccc' : '#137fec'} 
                  />
                </TouchableOpacity>
                <Text style={styles.orderNumber}>{index + 1}</Text>
                <TouchableOpacity
                  onPress={() => moveItem(index, 'down')}
                  disabled={index === localFavorites.length - 1}
                  style={[styles.reorderButton, index === localFavorites.length - 1 && styles.reorderButtonDisabled]}
                >
                  <MaterialCommunityIcons 
                    name="chevron-down" 
                    size={28} 
                    color={index === localFavorites.length - 1 ? '#ccc' : '#137fec'} 
                  />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.cardWrapper}>
              <FavoriteCard 
                anuncio={item} 
                onRemove={() => {
                  if (!isReordering) {
                    confirmRemove(item.id!);
                  }
                }} 
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#137fec" />
              <Text style={styles.loadingText}>Carregando favoritos...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="heart-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Você ainda não adicionou imóveis aos seus favoritos.</Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.exploreButtonText}>Explorar Imóveis</Text>
              </TouchableOpacity>
            </View>
          )
        }
        contentContainerStyle={[
          styles.contentContainer,
          localFavorites.length === 0 && styles.contentContainerEmpty
        ]}
        refreshing={loading}
        onRefresh={reloadFavorites}
      />
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  contentContainer: {
    flexGrow: 1,
  },
  contentContainerEmpty: {
    justifyContent: 'center',
  },
  main: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  profileSection: {
    marginBottom: 32,
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 24,
    height: 128,
    width: 128,
    borderRadius: 64,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 24,
  },
  editProfileButton: {
    marginBottom: 16,
    width: 250,
    borderRadius: 8,
    backgroundColor: '#137fec',
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  editProfileButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  logoutButton: {
    width: 250,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  logoutButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  favoritesSection: {
    paddingHorizontal: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  favoritesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  reorderButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  reorderButtonText: {
    color: '#137fec',
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  reorderButton: {
    padding: 4,
  },
  reorderButtonDisabled: {
    opacity: 0.3,
  },
  reorderActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  favoriteCardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  reorderControls: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 12,
    gap: 4,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#137fec',
  },
  cardWrapper: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    color: '#6b7280',
    fontSize: 16,
  },
  exploreButton: {
    backgroundColor: '#137fec',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
