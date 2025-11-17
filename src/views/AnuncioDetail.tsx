import { MaterialCommunityIcons } from '@expo/vector-icons'; // For icons
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios'; // Import axios
import * as ImagePicker from 'expo-image-picker'; // Assuming expo is available
import { User } from 'firebase/auth';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';
import { auth } from '../assets/firebaseConfig'; // Importar auth (storage será removido daqui)
import BottomNav from '../components/BottomNav';
import { RootStackParamList } from '../types/navigation';
import { uploadImageToSupabase } from '../services/uploadImageToSupabase';
import MapView, { Marker } from 'react-native-maps';
import { Anuncio } from '../models/Anuncio';
import FavoriteButton from '../components/FavoriteButton';
import { useFavorites } from '../contexts/FavoritesContext';

const { width } = Dimensions.get('window');

// URL base do seu backend
const BASE_URL = "https://privative-unphysiological-lamonica.ngrok-free.dev"; // <<<<< ESSA URL MUDA >>>>>

type AnuncioDetailScreenRouteProp = RouteProp<RootStackParamList, 'AnuncioDetail'>;
type AnuncioDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AnuncioDetail'>;

interface AnuncioDetailProps {
  route: AnuncioDetailScreenRouteProp;
  navigation: AnuncioDetailScreenNavigationProp;
}

interface Anunciante {
  uid: string;
  nome: string;
  foto: string;
  telefone: string;
}

type Comentario = {
  id: string;
  anuncioId: string;
  userId: string;
  texto: string;
  createdAt?: any;
  updatedAt?: any;
  userName?: string;
  userPhoto?: string;
};

interface UserBasic {
  uid: string;
  nome?: string;
  foto?: string;
}

const [userCache, setUserCache] = useState<Record<string, UserBasic>>({});

// A função uploadImageToStorage será removida

export default function AnuncioDetail({ route, navigation }: AnuncioDetailProps) {
  const { anuncioId } = route.params || {};
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [anunciante, setAnunciante] = useState<Anunciante | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  const [formTitulo, setFormTitulo] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formPreco, setFormPreco] = useState('');
  const [formImageUrl, setFormImageUrl] = useState<string | null>(null);
  const [formEndereco, setFormEndereco] = useState('');
  const [formNumero, setFormNumero] = useState('');
  const [formCidade, setFormCidade] = useState('');
  const [formEstado, setFormEstado] = useState('');
  const [formBairro, setFormBairro] = useState('');
  const [formCep, setFormCep] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const { isFavorite, addFavorite, removeFavorite, updateFavorite } = useFavorites();

  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);

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
    const loadData = async () => {
      if (!anuncioId) {
        setIsEditing(true);
        setLoading(false);
        return;
      }

      if (!idToken) {
        setLoading(true);
        return;
      }

      setLoading(true);
      try {
        // Fetch Anuncio
        const anuncioResponse = await axios.get<Anuncio>(`${BASE_URL}/anuncios/${anuncioId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const fetchedAnuncio = anuncioResponse.data;
        setAnuncio(fetchedAnuncio);

        // Pre-fill forms
        setFormTitulo(fetchedAnuncio.titulo);
        setFormDescricao(fetchedAnuncio.descricao);
        setFormPreco(fetchedAnuncio.preco?.toString() || '');
        setFormImageUrl(fetchedAnuncio.imageUrl);
        setFormEndereco(fetchedAnuncio.endereco?.logradouro || '');
        setFormNumero(fetchedAnuncio.endereco?.numero || '');
        setFormCidade(fetchedAnuncio.endereco?.cidade || '');
        setFormEstado(fetchedAnuncio.endereco?.estado || '');
        setFormBairro(fetchedAnuncio.endereco?.bairro || '');
        setFormCep(fetchedAnuncio.endereco?.cep || '');

        if (fetchedAnuncio.endereco?.latitude && fetchedAnuncio.endereco?.longitude) {
          setCoords({
            latitude: Number(fetchedAnuncio.endereco.latitude),
            longitude: Number(fetchedAnuncio.endereco.longitude),
          });
        }

        // Fetch Anunciante
        if (fetchedAnuncio.userId) {
          const userResponse = await axios.get<Anunciante>(`${BASE_URL}/users/${fetchedAnuncio.userId}`, {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          setAnunciante(userResponse.data);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível carregar os dados.',
        });
        setAnuncio(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [anuncioId, idToken]);

  // Carregar comentários quando abrir a tela ou trocar o anuncioId
  useEffect(() => {
    if (!anuncioId) return;
    fetchComentarios();
  }, [anuncioId]);

  const headersAuth = idToken
    ? { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };

  // Adicione logs para depurar 404
  useEffect(() => {
    console.log('DEBUG anuncioId:', anuncioId);
  }, [anuncioId]);

  const fetchUserForComment = async (uid: string) => {
    if (userCache[uid]) return userCache[uid];
    try {
      const { data } = await axios.get<UserBasic>(`${BASE_URL}/users/${uid}`, idToken ? { headers: { Authorization: `Bearer ${idToken}` } } : undefined);
      const userData: UserBasic = { uid, nome: (data as any).nome, foto: (data as any).foto };
      setUserCache(prev => ({ ...prev, [uid]: userData }));
      return userData;
    } catch {
      return { uid };
    }
  };

  const enrichComentarios = async (lista: Comentario[]) => {
    const enriched = await Promise.all(
      lista.map(async c => {
        const u = await fetchUserForComment(c.userId);
        return { ...c, userName: u.nome || 'Usuário', userPhoto: u.foto };
      })
    );
    setComentarios(enriched);
  };

  const fetchComentarios = async () => {
    if (!anuncioId) return;
    const url = `${BASE_URL}/anuncios/${anuncioId}/comentarios`;
    console.log('URL comentários:', url);
    try {
      const { data } = await axios.get<Comentario[]>(url);
      await enrichComentarios(data);
    } catch (e:any) {
      console.log('Erro ao listar comentários:', e?.response?.status, e?.response?.data || e.message);
    }
  };

  const criarComentario = async () => {
    if (!comentarioTexto.trim()) return;
    try {
      await axios.post(
        `${BASE_URL}/anuncios/${anuncioId}/comentarios`,
        { texto: comentarioTexto.trim() },
        { headers: headersAuth }
      );
      setComentarioTexto('');
      await fetchComentarios();
    } catch (e) {
      console.log('Erro ao criar comentário:', e);
    }
  };

  const iniciarEdicao = (c: Comentario) => {
    setEditandoId(c.id);
    setComentarioTexto(c.texto);
  };

  const salvarEdicao = async () => {
    if (!editandoId) return;
    try {
      await axios.put(
        `${BASE_URL}/anuncios/${anuncioId}/comentarios/${editandoId}`,
        { texto: comentarioTexto.trim() },
        { headers: headersAuth }
      );
      setEditandoId(null);
      setComentarioTexto('');
      await fetchComentarios();
    } catch (e) {
      console.log('Erro ao atualizar comentário:', e);
    }
  };

  const excluirComentario = async (id: string) => {
    try {
      await axios.delete(
        `${BASE_URL}/anuncios/${anuncioId}/comentarios/${id}`,
        { headers: headersAuth }
      );
      await fetchComentarios();
    } catch (e) {
      console.log('Erro ao excluir comentário:', e);
    }
  };

  const isOwner = anuncio && currentUser && anuncio.userId === currentUser.uid;

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permissão negada', 'É necessário permitir acesso à galeria.');
      return;
    }

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

  // Função utilitária para geocodificar endereço usando Nominatim
  async function geocodeAddressNominatim(enderecoCompleto: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SeuApp/1.0 (seuemail@dominio.com)',
      },
    });
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } else {
      throw new Error('Endereço não encontrado');
    }
  }

  const handleSave = async () => {
    if (!formTitulo || !formDescricao || !formPreco) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, preencha todos os campos obrigatórios: Título, Descrição e Preço.',
      });
      return;
    }

    if (!currentUser) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Você precisa estar logado para salvar um anúncio.',
      });
      return;
    }

    setLoading(true);
    let finalImageUrl = formImageUrl;

    // Se a imagem foi alterada e é uma URI local, faz upload
    if (formImageUrl && formImageUrl.startsWith('file://')) {
      try {
        finalImageUrl = await uploadImageToSupabase(formImageUrl, `anuncios/${anuncioId || Date.now()}.jpg`);
      } catch (e: any) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível enviar a imagem do anúncio.',
        });
        setLoading(false);
        return;
      }
    }

    try {
      const headers = { 'Authorization': `Bearer ${idToken}` };

      if (!finalImageUrl) {
        finalImageUrl = "https://via.placeholder.com/400x300?text=Sem+Imagem";
      }

      // Monte o endereço completo para geocodificação
      const enderecoCompleto = `${formEndereco}, ${formNumero}, ${formBairro}, ${formCidade}, ${formEstado}, ${formCep}`;
      // Geocodifique o endereço
      const coords = await geocodeAddressNominatim(enderecoCompleto);

      // Monte o objeto do anúncio com latitude e longitude preenchidos
      const anuncioDataToSave = {
        titulo: formTitulo,
        descricao: formDescricao,
        preco: parseFloat(formPreco),
        imageUrl: finalImageUrl || '',
        userId: currentUser.uid,
        endereco: {
          logradouro: formEndereco,
          numero: formNumero,
          bairro: formBairro,
          cidade: formCidade,
          estado: formEstado,
          cep: formCep,
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      };

      console.log('Enviando anúncio:', anuncioDataToSave);

      if (anuncioId) {
        const response = await axios.put<Anuncio>(
          `${BASE_URL}/anuncios/${anuncioId}`,
          anuncioDataToSave,
          { headers }
        );
        setAnuncio(response.data);
        if (isFavorite(response.data.id!)) {
          updateFavorite(response.data);
        }
        // Update form fields with the new data after successful save
        setFormTitulo(response.data.titulo);
        setFormDescricao(response.data.descricao);
        setFormPreco(response.data.preco?.toString() || ''); // Safely convert preco to string
        setFormImageUrl(response.data.imageUrl);
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Anúncio atualizado com sucesso!',
        });

        // Adiciona um pequeno atraso antes de sair do modo de edição e parar o loading
        setTimeout(() => {
          setIsEditing(false);
          setLoading(false); // Movido para dentro do setTimeout
        }, 1000); // 1 segundo de atraso

      } else {
        const response = await axios.post(
          `${BASE_URL}/anuncios`,
          { anuncioData: anuncioDataToSave }, // CERTO!
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setAnuncio(response.data);
        // Update form fields with the new data after successful save for new ad
        setFormTitulo(response.data.titulo);
        setFormDescricao(response.data.descricao);
        setFormPreco(response.data.preco?.toString() || ''); // Safely convert preco to string
        setFormImageUrl(response.data.imageUrl);
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Anúncio criado com sucesso!',
        });

          // Adiciona um pequeno atraso antes de sair do modo de edição e parar o loading
          setTimeout(() => {
            setIsEditing(false);
            navigation.setParams({ anuncioId: response.data.id });
            setLoading(false); // Movido para dentro do setTimeout
          }, 1000); // 1 segundo de atraso
      }

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Houve um problema ao salvar o anúncio.',
      });
      console.error("Erro ao salvar anúncio:", error);
      setLoading(false); // Garante que o loading pare mesmo em caso de erro
    }
  };

  const handleDelete = async () => {
    if (!anuncioId || !currentUser || !idToken) {
      Alert.alert("Erro", "Não foi possível deletar o anúncio.");
      return;
    }

    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja deletar este anúncio? Esta ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Deletar",
          onPress: async () => {
            setLoading(true);
            try {
              const headers = { 'Authorization': `Bearer ${idToken}` };
              await axios.delete(`${BASE_URL}/anuncios/${anuncioId}`, { headers });
              Alert.alert("Sucesso", "Anúncio deletado com sucesso!");
              navigation.goBack(); // Voltar para a tela anterior (ex: Home ou Meus Anúncios)
            } catch (error) {
              Alert.alert("Erro", "Houve um problema ao deletar o anúncio.");
              console.error("Erro ao deletar anúncio:", error);
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };


  const handleCancelEdit = () => {
    setIsEditing(false);

    if (anuncio && anuncioId) {
      // Restaura os valores originais
      setFormTitulo(anuncio.titulo);
      setFormDescricao(anuncio.descricao);
      setFormPreco(anuncio.preco?.toString() || ''); // Safely convert preco to string
      setFormImageUrl(anuncio.imageUrl);
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    async function fetchCoords() {
      if (formEndereco && formNumero && formCidade && formEstado) {
        try {
          const enderecoCompleto = `${formEndereco}, ${formNumero}, ${formCidade}, ${formEstado}`;
          const geo = await geocodeAddressNominatim(enderecoCompleto);
          setCoords(geo);
        } catch (e) {
          setCoords(null);
        }
      }
    }
    if (isEditing) fetchCoords();
  }, [formEndereco, formNumero, formCidade, formEstado, isEditing]);

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
    Toast.show({
      type: 'info',
      text1: 'Aviso',
      text2: 'Você precisa estar logado para ver este anúncio.',
    });
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
          <FavoriteButton anuncio={anuncio} />
        )}
        {isEditing && <View style={styles.headerButton} /> }
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>
            {!currentUser && anuncioId ? "Aguardando autenticação..." : "Carregando..."}
          </Text>
        </View>
      )}

      {!loading && (
        <FlatList
          data={comentarios}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View>
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
                  <Image
                    source={{ uri: anuncio?.imageUrl || "https://via.placeholder.com/400x300?text=Sem+Imagem" }}
                    style={styles.mainImage}
                  />
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
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Endereço"
                        value={formEndereco}
                        onChangeText={setFormEndereco}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Número"
                        value={formNumero}
                        onChangeText={setFormNumero}
                        keyboardType="numeric"
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Cidade"
                        value={formCidade}
                        onChangeText={setFormCidade}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Estado"
                        value={formEstado}
                        onChangeText={setFormEstado}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Bairro"
                        value={formBairro}
                        onChangeText={setFormBairro}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="CEP"
                        value={formCep}
                        onChangeText={setFormCep}
                        keyboardType="numeric"
                      />
                    </>
                  ) : (
                    <>
                      <Text style={styles.priceText}>
                        R$ {anuncio?.preco ? anuncio.preco.toLocaleString('pt-BR') : ''}
                      </Text>
                      <Text style={styles.descriptionText}>{anuncio?.descricao}</Text>
                    </>
                  )}
                </View>

                {anunciante && !isEditing && (
                  <View style={styles.anuncianteCard}>
                    <Text style={styles.sectionTitle}>Anunciante</Text>
                    <View style={styles.anuncianteInfo}>
                      <Image
                        source={{ uri: anunciante.foto || 'https://via.placeholder.com/150' }}
                        style={styles.anuncianteAvatar}
                      />
                      <View style={styles.anuncianteTextContainer}>
                        <Text style={styles.anuncianteName}>{anunciante.nome}</Text>
                        <Text style={styles.anuncianteContato}>{anunciante.telefone}</Text>
                      </View>
                      <TouchableOpacity style={styles.contactButton}>
                        <Text style={styles.contactButtonText}>Contactar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.locationCard}>
                  <Text style={styles.locationTitle}>Localização</Text>
                  {!isEditing && anuncio?.endereco && (
                    <Text style={styles.addressText}>
                      {`${anuncio.endereco.logradouro}, ${anuncio.endereco.numero} - ${anuncio.endereco.bairro}, ${anuncio.endereco.cidade} - ${anuncio.endereco.estado}, ${anuncio.endereco.cep}`}
                    </Text>
                  )}
                  <View style={styles.mapContainer}>
                    {coords ? (
                      <MapView
                        style={styles.mapImage}
                        initialRegion={{
                          latitude: coords.latitude,
                          longitude: coords.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        }}
                      >
                        <Marker coordinate={coords} />
                      </MapView>
                    ) : (
                      <Text>Mapa não disponível</Text>
                    )}
                  </View>
                </View>

                <Text style={{ fontWeight: '600', fontSize: 16, marginTop: 16 }}>Comentários</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={{ uri: item.userPhoto || 'https://via.placeholder.com/40' }}
                  style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>{item.userName || 'Usuário'}</Text>
                  <Text style={styles.commentText}>{item.texto}</Text>
                </View>
                {item.userId === currentUser?.uid && (
                  <TouchableOpacity onPress={() => iniciarEdicao(item)} style={{ padding: 4 }}>
                    <MaterialCommunityIcons name="dots-vertical" size={22} color="#555" />
                  </TouchableOpacity>
                )}
              </View>
              {item.userId === currentUser?.uid && editandoId === item.id && (
                <View style={styles.commentActions}>
                  <TouchableOpacity onPress={() => salvarEdicao()}>
                    <Text style={styles.editBtn}>Salvar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => excluirComentario(item.id)}>
                    <Text style={styles.deleteBtn}>Excluir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setEditandoId(null); setComentarioTexto(''); }}>
                    <Text style={{ color: '#666' }}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListFooterComponent={
            <View style={{ paddingHorizontal: 16, paddingBottom: 120 }}>
              <View style={styles.commentForm}>
                <TextInput
                  style={styles.commentInput}
                  placeholder={editandoId ? 'Editar comentário...' : 'Escreva um comentário...'}
                  value={comentarioTexto}
                  onChangeText={setComentarioTexto}
                />
                <TouchableOpacity
                  style={styles.commentSend}
                  onPress={editandoId ? salvarEdicao : criarComentario}
                  disabled={!comentarioTexto.trim()}
                >
                  <Text style={{ color: 'white' }}>{editandoId ? 'Salvar' : 'Enviar'}</Text>
                </TouchableOpacity>
              </View>

              {isEditing && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]}>
                    <Text style={styles.buttonText}>Salvar Anúncio</Text>
                  </TouchableOpacity>
                  {isOwner && anuncioId && (
                    <TouchableOpacity onPress={handleDelete} style={[styles.button, styles.deleteButton]}>
                      <Text style={styles.buttonText}>Deletar Anúncio</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={handleCancelEdit} style={[styles.button, styles.cancelButton]}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      {isOwner && anuncioId && !isEditing && (
        <TouchableOpacity style={styles.fab} onPress={() => setIsEditing(true)}>
          <MaterialCommunityIcons name="pencil" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <BottomNav />
      <Toast />
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
  anuncianteCard: {
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
  anuncianteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  anuncianteAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  anuncianteTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  anuncianteName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  anuncianteContato: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactButton: {
    backgroundColor: '#137fec',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  deleteButton: {
    backgroundColor: '#dc3545', // Cor para o botão de deletar
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
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 24 },
  commentItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  commentText: { color: "#333" },
  commentActions: { flexDirection: "row", gap: 16, marginTop: 6 },
  editBtn: { color: "#007AFF" },
  deleteBtn: { color: "#FF3B30" },
  commentForm: { flexDirection: "row", marginTop: 16, alignItems: "center" },
  commentInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  commentSend: { marginLeft: 8, backgroundColor: "#007AFF", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
});