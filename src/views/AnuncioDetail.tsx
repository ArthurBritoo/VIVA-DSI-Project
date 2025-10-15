import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from '../components/BottomNav';
// import Header from "../components/Header"; // We'll create a custom header for this screen
import { MaterialCommunityIcons } from '@expo/vector-icons'; // For icons
import { RootStackParamList } from '../types/navigation';

const { width } = Dimensions.get('window');

type AnuncioDetailScreenRouteProp = RouteProp<RootStackParamList, 'AnuncioDetail'>;
type AnuncioDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AnuncioDetail'>;

interface AnuncioDetailProps {
  route: AnuncioDetailScreenRouteProp;
  navigation: AnuncioDetailScreenNavigationProp;
}

interface Anuncio {
  id: string;
  titulo: string;
  descricao: string;
  preco: string;
  endereco: string;
  caracteristicas: string[];
  imageUrl: string;
  mapImageUrl: string;
  userId: string; // To check if the current user owns the ad
}

// Mock API functions for demonstration
const fetchAnuncioById = async (id: string): Promise<Anuncio | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (id === "1") {
        resolve({
          id: "1",
          titulo: "Apartamento Moderno no Centro",
          descricao: "Este deslumbrante apartamento de 2 quartos e 2 banheiros apresenta um design moderno com uma planta aberta, cozinha gourmet e um espaçoso quintal. Aceita animais de estimação e está localizado em um bairro desejável.",
          preco: "R$ 1.200.000",
          endereco: "234 Elm Street, Anytown, CA",
          caracteristicas: ["2 Quartos", "2 Banheiros", "Aceita Animais"],
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuKRMH2yrXA8R5dhstzuxT0UaiZ_AhmuIGmNDGIIcghNLMTKIupyIZh6L3SJ-_iuGBgZ9mXKrCu0FFt4EJwSX-9GReQ4J8c6SviZMVetQhu_6US0oU07iQ5zVfbY5cDsKJiV1n34ChHlMXjozay-X1qRBG_gp9DodDDzAhooH_GvZDtdCbrc9WQG_Rf1XFD4UKrjLGcNvt275fjEjRGES6xqdqMrdY9y_sifWTz_ktMAgQBiHc4yaDIpqccAeVgLj5Tu0kbiEFPc4",
          mapImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLL02BYUuUzkcAjxCexivrvKvMYZAFj0YzuEnuNxWCfrxEDnjjrNZisOVtC9eEzJquuFt0VqH1h7q40QDKRMGI7chl6A_nFLdWWG2tyZlrn8XGV1omUMKpJU7bsHa8yX3yMC1IWxPYOo9G_exKoO8gRcUesUYGa9_2DjuGe6RZEgexzAYtBI4Z2q4aEmtSClqz4KQiEyA2qSK_cX4W8Y81wyXaivHxfg_24sCKlROIa8zJDBY1SDb-bvyllsnUPfnjlkcKCkKX-eh4",
          userId: "user123", // Mock user ID for this ad
        });
      } else if (id === "2") {
        resolve({
          id: "2",
          titulo: "Casa com Jardim",
          descricao: "Uma bela casa com um grande jardim, 3 quartos e 2 banheiros. Perfeita para famílias. Localizada em um bairro tranquilo.",
          preco: "R$ 750.000",
          endereco: "Rua das Flores, 10, Cidade Verde, MG",
          caracteristicas: ["3 Quartos", "2 Banheiros", "Jardim"],
          imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAt8atNVwwMEwiuYwWFHG5qD1cWRQgJ1kv5o0G_rjxY42I8KCeEkDEG_p6q618QogJbMbnUGjLhZZGPCyKWjHKYfSfB0iDJWbTaoDxCq2DnG-mC-abLoWRNRcKbS0YrhO3TAuaPuxXs5F3C4mTgGac4oHkcYG0ZuPP1O_OVEooRtO-CBp5zDijoUh7CpRoMVjNMK-C3WZpACuC9l4JAfdt4tI3p3dLh0Nhx5So6Ps59J5QPK0mVw8Fb8iC7SIDUsUTtj-cx-7_1-Aw",
          mapImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLL02BYUuUzkcAjxCexivrvKvMYZAFj0YzuEnuNxWCfrxEDnjjrNZisOVtC9eEzJquuFt0VqH1h7q40QDKRMGI7chl6A_nFLdWWG2tyZlrn8XGV1omUMKpJU7bsHa8yX3yMC1IWxPYOo9G_exKoO8gRcUesUYGa9_2DjuGe6RZEgexzAYtBI4Z2q4aEmtSClqz4KQiEyA2qSK_cX4W8Y81wyXaivHxfg_24sCKlROIa8zJDBY1SDb-bvyllsnUPfnjlkcKCkKX-eh4",
          userId: "anotherUser", // Mock user ID for this ad
        });
      }
      else {
        resolve(null); // Ad not found
      }
    }, 1000);
  });
};

const createAnuncioApi = async (anuncioData: Omit<Anuncio, 'id' | 'userId' | 'caracteristicas' | 'imageUrl' | 'mapImageUrl'>, userId: string): Promise<Anuncio> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newAnuncio = {
        ...anuncioData,
        id: String(Date.now()),
        userId,
        caracteristicas: ["Novo"],
        imageUrl: "https://via.placeholder.com/400x300?text=Novo+Anuncio",
        mapImageUrl: "https://via.placeholder.com/400x300?text=Mapa+Novo+Anuncio",
      };
      console.log("Creating anuncio:", newAnuncio);
      resolve(newAnuncio as Anuncio);
    }, 1000);
  });
};

const updateAnuncioApi = async (id: string, anuncioData: Partial<Anuncio>): Promise<Anuncio> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Updating anuncio:", id, anuncioData);
      // In a real app, you'd merge with existing data in your database
      resolve({ id, ...anuncioData } as Anuncio);
    }, 1000);
  });
};


export default function AnuncioDetail({ route, navigation }: AnuncioDetailProps) {
  const { anuncioId } = route.params || {};
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Mock current user ID for demonstration. 
  const currentUserId = "user123"; 

  const [formTitulo, setFormTitulo] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formPreco, setFormPreco] = useState('');
  const [formEndereco, setFormEndereco] = useState('');

  useEffect(() => {
    const loadAnuncio = async () => {
      if (anuncioId) {
        setLoading(true);
        const fetchedAnuncio = await fetchAnuncioById(anuncioId);
        setAnuncio(fetchedAnuncio);
        if (fetchedAnuncio) {
          setFormTitulo(fetchedAnuncio.titulo);
          setFormDescricao(fetchedAnuncio.descricao);
          setFormPreco(fetchedAnuncio.preco);
          setFormEndereco(fetchedAnuncio.endereco);
        }
        setLoading(false);
      } else {
        // If no anuncioId, it's a new ad. Start in editing mode.
        setIsEditing(true);
        setLoading(false);
        // Clear form fields for a new ad
        setFormTitulo('');
        setFormDescricao('');
        setFormPreco('');
        setFormEndereco('');
      }
    };

    loadAnuncio();
  }, [anuncioId]);

  const handleSave = async () => {
    if (!formTitulo || !formDescricao || !formPreco || !formEndereco) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      if (anuncioId) {
        const updatedAnuncio = await updateAnuncioApi(anuncioId, {
          titulo: formTitulo,
          descricao: formDescricao,
          preco: formPreco,
          endereco: formEndereco,
        });
        setAnuncio(updatedAnuncio);
        Alert.alert("Sucesso", "Anúncio atualizado com sucesso!");
      } else {
        const newAnuncio = await createAnuncioApi({
          titulo: formTitulo,
          descricao: formDescricao,
          preco: formPreco,
          endereco: formEndereco,
        }, currentUserId);
        setAnuncio(newAnuncio);
        Alert.alert("Sucesso", "Anúncio criado com sucesso!");
        navigation.setParams({ anuncioId: newAnuncio.id }); 
      }
      setIsEditing(false); // Exit editing mode after saving
    } catch (error) {
      Alert.alert("Erro", "Houve um problema ao salvar o anúncio.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // If editing an existing ad, reset form fields to current anuncio data
    if (anuncio && anuncioId) {
      setFormTitulo(anuncio.titulo);
      setFormDescricao(anuncio.descricao);
      setFormPreco(anuncio.preco);
      setFormEndereco(anuncio.endereco);
    } else {
      // If creating a new ad, navigate back or clear fields
      navigation.goBack(); // Or clear fields if staying on screen
    }
  };

  const isOwner = anuncio && anuncio.userId === currentUserId;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Carregando...</Text>
          <View style={styles.headerButton} />{/* Placeholder for right button */}
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
        <BottomNav/>
      </SafeAreaView>
    );
  }

  if (!anuncio && anuncioId && !isEditing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Anúncio não encontrado</Text>
          <View style={styles.headerButton} />{/* Placeholder for right button */}
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Anúncio não encontrado.</Text>
          <Button title="Voltar" onPress={() => navigation.goBack()} />
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
        {isEditing && <View style={styles.headerButton} /> /* Placeholder to maintain spacing */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Conditional Form for Editing/Creating */}
        {isEditing && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>{anuncioId ? "Editar Anúncio" : "Criar Novo Anúncio"}</Text>
            <TextInput
              style={styles.input}
              placeholder="Título"
              value={formTitulo}
              onChangeText={setFormTitulo}
            />
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={formDescricao}
              onChangeText={setFormDescricao}
              multiline
              numberOfLines={4}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço"
              value={formPreco}
              onChangeText={setFormPreco}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Endereço"
              value={formEndereco}
              onChangeText={setFormEndereco}
            />
            <View style={styles.buttonContainer}>
              <Button title="Salvar Anúncio" onPress={handleSave} color="#28a745" />
              <Button title="Cancelar" onPress={handleCancelEdit} color="#dc3545" />
            </View>
          </View>
        )}

        {/* Existing UI for viewing the announcement, only visible if not in editing mode and if anuncio exists*/}
        {!isEditing && anuncio && (
          <View>
            <View style={styles.imageGallery}>
              <Image source={{ uri: anuncio.imageUrl }} style={styles.mainImage} />
              <View style={styles.paginationContainer}>
                {/* These dots are static for now, would be dynamic with a carousel library */}
                <View style={styles.paginationDotActive}></View>
                <View style={styles.paginationDot}></View>
                <View style={styles.paginationDot}></View>
                <View style={styles.paginationDot}></View>
                <View style={styles.paginationDot}></View>
              </View>
            </View>

            <View style={styles.contentPadding}>
              <View style={styles.infoCard}>
                <Text style={styles.priceText}>{anuncio.preco}</Text>
                <Text style={styles.addressText}>{anuncio.endereco}</Text>
                <View style={styles.featuresContainer}>
                  {anuncio.caracteristicas.map((carac, index) => (
                    <View key={index} style={styles.featurePill}>
                      <Text style={styles.featureText}>{carac}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.descriptionText}>{anuncio.descricao}</Text>
              </View>

              <View style={styles.locationCard}>
                <Text style={styles.locationTitle}>Localização</Text>
                <View style={styles.mapContainer}>
                  <Image source={{ uri: anuncio.mapImageUrl }} style={styles.mapImage} />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* If no anuncioId and not editing, we need to handle this state. 
            This should theoretically be caught by isEditing || !anuncioId check in useEffect, 
            but as a fallback for the ScrollView content if needed. */}
        {!anuncioId && !isEditing && (
          <View style={styles.noAnuncioContainer}>
            <Text style={styles.noAnuncioText}>Nenhum anúncio para exibir. Comece a criar um!</Text>
            <Button title="Criar Novo Anúncio" onPress={() => setIsEditing(true)} />
          </View>
        )}
      </ScrollView>

      {/* Edit Button for existing ads, only if not editing and is owner */}
      {isOwner && anuncioId && !isEditing && (
        <View style={styles.editButtonFixedContainer}>
          <Button title="Editar Anúncio" onPress={() => setIsEditing(true)} color="#007bff" />
        </View>
      )}

      {/* Bottom Nav always visible */}
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
  formContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2, 
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  // Custom Header Styles to match HTML
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8, // Adjust as per HTML
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
  // Image Gallery Styles
  imageGallery: {
    position: "relative",
    height: 320, 
    width: "100%",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
  // Info Card Styles
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
  },
  featuresContainer: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, 
  },
  featurePill: {
    borderRadius: 9999, 
    backgroundColor: "rgba(19, 127, 236, 0.1)", 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
  },
  featureText: {
    fontSize: 14, 
    fontWeight: "500", 
    color: "#137fec", 
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
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  editButtonFixedContainer: {
    position: 'absolute',
    bottom: 100, 
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent', 
    zIndex: 100, // Ensure it's above other elements
  },
  noAnuncioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200, // Ensure it takes some space
  },
  noAnuncioText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  }
});