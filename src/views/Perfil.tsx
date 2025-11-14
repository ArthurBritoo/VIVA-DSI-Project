import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserContext } from '../contexts/UserContext';
import Header  from "../components/Header";
import BottomNav from "../components/BottomNav";
import { useFavorites } from '../contexts/FavoritesContext';
import FavoriteCard from '../components/FavoriteCard';

// Defina o tipo RootStackParamList com todas as rotas disponíveis no seu stack
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
  // Tipando o useNavigation com NativeStackNavigationProp
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { currentUser, setCurrentUser } = useUserContext();
  const { favorites, removeFavorite, loading } = useFavorites();

  const handleLogout = () => {
    setCurrentUser(null);
    navigation.navigate('Login'); // Agora o TypeScript reconhece 'Login' como uma rota válida
  };

  const confirmRemove = (id: string) => {
    Alert.alert(
      "Remover Favorito",
      "Tem certeza que deseja remover este imóvel dos seus favoritos?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { text: "Sim, remover", onPress: () => removeFavorite(id), style: 'destructive' }
      ]
    );
  };

  console.log('URL da foto:', currentUser?.foto);

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
                    <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.favoritesSection}>
                <Text style={styles.sectionTitle}>Meus Favoritos</Text>
              </View>
            </>
          }
          data={favorites}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <View style={styles.favoriteCardContainer}>
              <FavoriteCard anuncio={item} onRemove={() => confirmRemove(item.id!)} />
            </View>
          )}
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.emptyText}>Você ainda não adicionou imóveis aos seus favoritos.</Text>
            ) : null
          }
          contentContainerStyle={styles.contentContainer}
        />
      <BottomNav/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  flexGrow: {
    flexGrow: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Simulating white/10
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Simulating white/80
    padding: 16,
    paddingBottom: 12,
  },
  headerSpacer: {
    width: 40,
  },
  
  main: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  profileSection: {
    marginBottom: 32, // mb-8 (8 * 4 = 32)
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 24, // mb-6 (6 * 4 = 24)
    height: 128, // h-32 (32 * 4 = 128)
    width: 128, // w-32 (32 * 4 = 128)
    borderRadius: 64,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 24,
  },
  editProfileButton: {
    marginBottom: 16, // mb-4 (4 * 4 = 16)
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  favoriteCardContainer: {
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6b7280',
    fontSize: 16,
    paddingHorizontal: 16,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    height: 64,
    backgroundColor: '#f6f7f8',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
    color: '#6b7280',
  },
  navLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
});
