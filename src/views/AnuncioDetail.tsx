import { MaterialCommunityIcons } from '@expo/vector-icons'; // For icons
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios'; // Import axios
import * as ImagePicker from 'expo-image-picker'; // Assuming expo is available
import { User } from 'firebase/auth';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from '../assets/firebaseConfig'; // Importar auth (storage será removido daqui)
import BottomNav from '../components/BottomNav';
import { RootStackParamList } from '../types/navigation';

const { width } = Dimensions.get('window');

// URL base do seu backend
const BASE_URL = "https://fbb29161ca15.ngrok-free.app"; // <<<<< ESSA URL MUDA >>>>>

type AnuncioDetailScreenRouteProp = RouteProp<RootStackParamList, 'AnuncioDetail'>;
type AnuncioDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AnuncioDetail'>;

interface AnuncioDetailProps {
  route: AnuncioDetailScreenRouteProp;
  navigation: AnuncioDetailScreenNavigationProp;
}

interface Anuncio {
  id?: string; // ID é opcional para novos anúncios
  titulo: string;
  descricao: string;
  preco: number; // Alterado para number para corresponder ao backend
  imageUrl: string;
  userId: string;
  createdAt?: Date; // Opcional, será gerado no backend
}

// A função uploadImageToStorage será removida

export default function AnuncioDetail({ route, navigation }: AnuncioDetailProps) {
  const { anuncioId } = route.params || {};
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  const [formTitulo, setFormTitulo] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formPreco, setFormPreco] = useState('');
  const [formImageUrl, setFormImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken(true);
          setIdToken(token);
        } catch (error) {
          console.error("Error getting ID token:", error);
          setIdToken(null);
        }
      } else {
        setIdToken(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadAnuncio = async () => {
      if (!currentUser && anuncioId) {
        setLoading(true);
        return; 
      }

      if (anuncioId) {
        setLoading(true);
        try {
          const response = await axios.get<Anuncio>(`${BASE_URL}/anuncios/${anuncioId}`);
          const fetchedAnuncio = response.data;
          setAnuncio(fetchedAnuncio);
          setFormTitulo(fetchedAnuncio.titulo);
          setFormDescricao(fetchedAnuncio.descricao);
          setFormPreco(fetchedAnuncio.preco.toString());
          setFormImageUrl(fetchedAnuncio.imageUrl);
        } catch (error) {
          console.error("Error fetching anuncio:", error);
          Alert.alert("Erro", "Não foi possível carregar o anúncio.");
          setAnuncio(null);
        } finally {
          setLoading(false);
        }
      } else if (currentUser) {
        setIsEditing(true);
        setLoading(false);
        setFormTitulo('');
        setFormDescricao('');
        setFormPreco('');
        setFormImageUrl(null);
      } else {
        setLoading(false);
      }
    };

    loadAnuncio();
  }, [anuncioId, currentUser]);

  const isOwner = anuncio && currentUser && anuncio.userId === currentUser.uid;

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFormImageUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!formTitulo || !formDescricao || !formPreco) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios: Título, Descrição e Preço.");
      return;
    }

    if (!currentUser) {
      Alert.alert("Erro", "Você precisa estar logado para salvar um anúncio.");
      return;
    }

    setLoading(true);
    let finalImageUrl = formImageUrl;

    try {
      const headers = { 'Authorization': `Bearer ${idToken}` };

      if (!finalImageUrl) {
        finalImageUrl = "https://via.placeholder.com/400x300?text=Sem+Imagem";
      }

      const anuncioDataToSave: Omit<Anuncio, 'id' | 'createdAt'> = {
        titulo: formTitulo,
        descricao: formDescricao,
        preco: parseFloat(formPreco),
        imageUrl: finalImageUrl || '',
        userId: currentUser.uid, 
      };

      if (anuncioId) {
        const response = await axios.put<Anuncio>(
          `${BASE_URL}/anuncios/${anuncioId}`,
          anuncioDataToSave,
          { headers }
        );
        setAnuncio(response.data);
        Alert.alert("Sucesso", "Anúncio atualizado com sucesso!");
      } else {
        const response = await axios.post<Anuncio>(
          `${BASE_URL}/anuncios`,
          { anuncioData: anuncioDataToSave, userId: currentUser.uid },
          { headers }
        );
        setAnuncio(response.data);
        Alert.alert("Sucesso", "Anúncio criado com sucesso!");
        navigation.setParams({ anuncioId: response.data.id });
      }

      setIsEditing(false);
    } catch (error) {
      Alert.alert("Erro", "Houve um problema ao salvar o anúncio.");
      console.error("Erro ao salvar anúncio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);

    if (anuncio && anuncioId) {
      // Restaura os valores originais
      setFormTitulo(anuncio.titulo);
      setFormDescricao(anuncio.descricao);
      setFormPreco(anuncio.preco.toString());
      setFormImageUrl(anuncio.imageUrl);
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Carregando...</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>{!currentUser && anuncioId ? "Aguardando autenticação..." : "Carregando..."}</Text>
        </View>
        <BottomNav/>
      </SafeAreaView>
    );
  }

  if (!currentUser && anuncioId) {
    Alert.alert("Aviso", "Você precisa estar logado para ver este anúncio.");
    navigation.navigate('Login'); 
    return null;
  }

  if (!anuncio && anuncioId && !isEditing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Anúncio não encontrado</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Anúncio não encontrado.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
        <BottomNav/>
      </SafeAreaView>
    );
  }

  const displayTitle = anuncioId ? (anuncio ? anuncio.titulo : "Detalhes do Anúncio") : "Criar Novo Anúncio";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{displayTitle}</Text>
        {anuncio && !isEditing && (
          <TouchableOpacity style={styles.headerButton}>
            <MaterialCommunityIcons name="share-variant" size={24} color="#000" />
          </TouchableOpacity>
        )} 
        {isEditing && <View style={styles.headerButton} /> }
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageGallery}>
          {isEditing ? (
            <TouchableOpacity onPress={handlePickImage} style={styles.imagePickerContainer}>
              {formImageUrl ? (
                <Image source={{ uri: formImageUrl }} style={styles.mainImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons name="camera-plus" size={50} color="#ccc" />
                  <Text style={styles.imagePlaceholderText}>Adicionar Imagem</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <Image source={{ uri: anuncio?.imageUrl || "https://via.placeholder.com/400x300?text=Sem+Imagem" }} style={styles.mainImage} />
          )}
          
          {!isEditing && (
            <View style={styles.paginationContainer}>
              <View style={styles.paginationDotActive}></View>
              <View style={styles.paginationDot}></View>
              <View style={styles.paginationDot}></View>
              <View style={styles.paginationDot}></View>
              <View style={styles.paginationDot}></View>
            </View>
          )}
        </View>

        <View style={styles.contentPadding}>
          <View style={styles.infoCard}>
            {isEditing ? (
              <>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  placeholder="Preço"
                  value={formPreco}
                  onChangeText={setFormPreco}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Título"
                  value={formTitulo}
                  onChangeText={setFormTitulo}
                />
                <TextInput
                  style={[styles.input, styles.descriptionInput]}
                  placeholder="Descrição"
                  value={formDescricao}
                  onChangeText={setFormDescricao}
                  multiline
                  numberOfLines={4}
                />
              </>
            ) : (
              <>
                <Text style={styles.priceText}>R$ {anuncio?.preco ? anuncio.preco.toLocaleString('pt-BR') : ''}</Text>
                <Text style={styles.descriptionText}>{anuncio?.descricao}</Text>
              </>
            )}
          </View>

          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>Localização</Text>
            <View style={styles.mapContainer}>
              <Image source={{ uri: "https://via.placeholder.com/400x300?text=Mapa" }} style={styles.mapImage} />
            </View>
          </View>
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]}>
              <Text style={styles.buttonText}>Salvar Anúncio</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancelEdit} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {!anuncioId && !isEditing && (
          <View style={styles.noAnuncioContainer}>
            <Text style={styles.noAnuncioText}>Nenhum anúncio para exibir. Comece a criar um!</Text>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.button}>
              <Text style={styles.buttonText}>Criar Novo Anúncio</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {isOwner && anuncioId && !isEditing && (
        <TouchableOpacity style={styles.fab} onPress={() => setIsEditing(true)}>
          <MaterialCommunityIcons name="pencil" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <BottomNav/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f7f8", 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8, 
    backgroundColor: "#f6f7f8", 
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20, 
    backgroundColor: "#f6f7f8", 
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  imageGallery: {
    position: "relative",
    height: 320, 
    width: "100%",
    backgroundColor: '#e0e0e0', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePickerContainer: {
    width: "100%",
    height: "100%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#e9ecef',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#6c757d',
    fontSize: 16,
  },
  paginationContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8, 
  },
  paginationDot: {
    width: 24, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: "rgba(255,255,255,0.5)", 
  },
  paginationDotActive: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff", 
  },
  contentPadding: {
    padding: 16,
  },
  infoCard: {
    borderRadius: 12, 
    backgroundColor: "#fff", 
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2, 
  },
  priceText: {
    fontSize: 28, 
    fontWeight: "bold",
    color: "#000", 
  },
  addressText: {
    marginTop: 4,
    fontSize: 16, 
    color: "#4b5563", 
    marginBottom: 10,
  },
  featuresContainer: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, 
    marginBottom: 10,
  },
  featurePill: {
    borderRadius: 9999, 
    backgroundColor: "rgba(19, 127, 236, 0.1)", 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
  },
  featurePillEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    backgroundColor: "rgba(19, 127, 236, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featureText: {
    fontSize: 14, 
    fontWeight: "500", 
    color: "#137fec", 
  },
  removeFeatureButton: {
    marginLeft: 5,
  },
  descriptionText: {
    marginTop: 16,
    fontSize: 16, 
    color: "#374151", 
  },
  locationCard: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2, 
  },
  locationTitle: {
    fontSize: 20, 
    fontWeight: "bold",
    color: "#000", 
    marginBottom: 10,
  },
  mapContainer: {
    marginTop: 12,
    aspectRatio: 16 / 9, 
    width: "100%",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8, 
    resizeMode: "cover",
  },
  input: {
    height: 50,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  priceInput: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  descriptionInput: {
    height: 120, 
    textAlignVertical: 'top', 
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 100, 
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  fab: {
    position: 'absolute',
    bottom: 135, 
    right: 20,
    backgroundColor: '#007bff',
    width: 70,
    height: 70,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 100, 
  },
  noAnuncioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200, 
  },
  noAnuncioText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  featuresEditContainer: {
    marginBottom: 15,
  },
  newFeatureInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  newFeatureInput: {
    flex: 1,
    marginBottom: 0, 
    marginRight: 10,
  },
  addFeatureButton: {
    padding: 8,
  }
});