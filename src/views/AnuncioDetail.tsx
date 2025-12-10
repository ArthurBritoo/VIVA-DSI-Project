import { MaterialCommunityIcons } from '@expo/vector-icons'; // For icons
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios'; // Import axios
import * as ImagePicker from 'expo-image-picker'; // Assuming expo is available
import { User } from 'firebase/auth';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, Linking, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"; // <-- ADICIONE Linking
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';
import { auth } from '../assets/firebaseConfig'; // Importar auth (storage será removido daqui)
import BottomNav from '../components/BottomNav';
import FavoriteButton from '../components/FavoriteButton';
import { useFavorites } from '../contexts/FavoritesContext';
import { useRecentlyViewed } from '../contexts/RecentlyViewedContext'; // <-- ADICIONE esta linha
import { Anuncio } from '../models/Anuncio';
import { uploadImageToSupabase } from '../services/uploadImageToSupabase';
import { RootStackParamList } from '../types/navigation';
import * as Clipboard from 'expo-clipboard'; // <-- MUDE ESTE IMPORT
import { useComentarios } from '../contexts/ComentariosContext'; // <-- ADICIONE ESTA LINHA
import { Comentario } from '../models/Comentario';

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


interface UserBasic {
  uid: string;
  nome?: string;
  foto?: string;
}



// A função uploadImageToStorage será removida

export default function AnuncioDetail({ route, navigation }: AnuncioDetailProps) {
  const [userCache, setUserCache] = useState<Record<string, UserBasic>>({});
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
  const [formAreaConstruida, setFormAreaConstruida] = useState('');
  const [formAreaTerreno, setFormAreaTerreno] = useState('');
  const [formAnoConstrucao, setFormAnoConstrucao] = useState('');
  const [formPadraoAcabamento, setFormPadraoAcabamento] = useState('');
  const [formTipoImovel, setFormTipoImovel] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const { isFavorite, addFavorite, removeFavorite, updateFavorite } = useFavorites();
  const { addToRecentlyViewed } = useRecentlyViewed(); // <-- ADICIONE esta linha
  const [predictedLabel, setPredictedLabel] = useState<string | null>(null);
  const [loadingLabel, setLoadingLabel] = useState(false);

  const { 
    comentarios: comentariosContext, 
    loading: loadingComentarios, 
    loadComentarios, 
    addComentario, 
    deleteComentario,
    updateComentario // <-- ADICIONE ESTA LINHA
  } = useComentarios();
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [comentarioTitulo, setComentarioTitulo] = useState(''); // <-- ADICIONE
  const [comentarioRating, setComentarioRating] = useState(5); // <-- ADICIONE
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarModalComentario, setMostrarModalComentario] = useState(false); // <-- ADICIONE

  // ADICIONE ESTADOS:
  const [editandoComentarioId, setEditandoComentarioId] = useState<string | null>(null);
  const [editandoTitulo, setEditandoTitulo] = useState('');
  const [editandoTexto, setEditandoTexto] = useState('');
  const [editandoRating, setEditandoRating] = useState(5);
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);

  // Simplificar:
  const comentariosParaExibir = comentariosContext || [];

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

        await addToRecentlyViewed(fetchedAnuncio);

        // Fetch Anunciante
        if (fetchedAnuncio.userId) {
          const userResponse = await axios.get<Anunciante>(`${BASE_URL}/users/${fetchedAnuncio.userId}`, {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          setAnunciante(userResponse.data);
        }

        // Carregar comentários UMA VEZ
        await loadComentarios(anuncioId);

      } catch (error) {
        console.error("Error fetching data:", error);
        setAnuncio(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // REMOVE loadComentarios da dependency array
  }, [anuncioId, idToken]); // <-- REMOVA loadComentarios DAQUI

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

  const fetchPredictedLabel = async () => {
    if (!formAreaConstruida || !formAreaTerreno || !formAnoConstrucao || !formPadraoAcabamento || !formTipoImovel || !formBairro || !coords) {
      Alert.alert('Dados incompletos', 'Preencha todas as informações do imóvel.');
      return;
    }
  
    setLoadingLabel(true);
    setPredictedLabel(null);
  
    try {
      const response = await axios.post(
        'https://pisi3-project.onrender.com/predict', // URL da sua API
        {
          area_construida: parseFloat(formAreaConstruida),
          area_terreno: parseFloat(formAreaTerreno),
          ano_construcao: parseInt(formAnoConstrucao),
          padrao_acabamento: formPadraoAcabamento,
          cluster: 0, // se você tiver o cluster no backend, coloque aqui
          bairro: formBairro,
          tipo_imovel: formTipoImovel
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      setPredictedLabel(response.data.predicted_category);
    } catch (error) {
      console.error('Erro ao obter rótulo:', error);
      Alert.alert('Erro', 'Não foi possível gerar o rótulo.');
    } finally {
      setLoadingLabel(false);
    }
  };
  

  const criarComentario = async () => {
    if (!comentarioTitulo.trim() || !comentarioTexto.trim()) {
      Alert.alert('Erro', 'Preencha título e descrição');
      return;
    }
    
    if (!anuncioId) {
      Alert.alert('Erro', 'ID do anúncio não encontrado');
      return;
    }

    try {
      await addComentario(anuncioId, comentarioTitulo, comentarioTexto, comentarioRating);
      setComentarioTitulo('');
      setComentarioTexto('');
      setComentarioRating(5);
      setMostrarModalComentario(false);
      
      // AGUARDE UM POUCO E DEPOIS RECARREGUE
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadComentarios(anuncioId);
      
      Alert.alert('Sucesso', 'Comentário adicionado!');
    } catch (e) {
      console.log('Erro ao criar comentário:', e);
      Alert.alert('Erro', 'Não foi possível adicionar o comentário');
    }
  };

  // FUNÇÃO PARA EDITAR (ÚNICA):
  const iniciarEdicaoComentario = (comentario: Comentario) => {
    setEditandoComentarioId(comentario.id);
    setEditandoTitulo(comentario.titulo);
    setEditandoTexto(comentario.texto || comentario.descricao || '');
    setEditandoRating(comentario.rating);
    setMostrarModalEdicao(true);
  };

  const salvarEdicaoComentario = async () => {
    if (!editandoComentarioId || !anuncioId) return;

    try {
      await updateComentario(
        anuncioId,
        editandoComentarioId,
        editandoTitulo,
        editandoTexto,
        editandoRating
      );
      setMostrarModalEdicao(false);
      setEditandoComentarioId(null);
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadComentarios(anuncioId);
      Alert.alert('Sucesso', 'Comentário atualizado!');
    } catch (e) {
      console.log('Erro ao atualizar comentário:', e);
      Alert.alert('Erro', 'Não foi possível atualizar o comentário');
    }
  };

  // FUNÇÃO PARA DELETAR (ÚNICA):
  const deletarComentario = async (comentarioId: string) => {
    if (!anuncioId) return;

    Alert.alert('Deletar Comentário', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteComentario(anuncioId, comentarioId);
            await new Promise(resolve => setTimeout(resolve, 500));
            await loadComentarios(anuncioId);
            Alert.alert('Sucesso', 'Comentário deletado!');
          } catch (e) {
            console.log('Erro ao deletar comentário:', e);
            Alert.alert('Erro', 'Não foi possível deletar o comentário');
          }
        },
      },
    ]);
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
        // ⭐ NOVOS CAMPOS ML
        area_construida: formAreaConstruida ? parseFloat(formAreaConstruida) : undefined,
        area_terreno: formAreaTerreno ? parseFloat(formAreaTerreno) : undefined,
        ano_construcao: formAnoConstrucao ? parseInt(formAnoConstrucao) : undefined,
        padrao_acabamento: formPadraoAcabamento || undefined,
        tipo_imovel: formTipoImovel || undefined,
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

  const handleContact = () => {
    if (!anunciante?.telefone) {
      Alert.alert('Erro', 'Telefone do anunciante não disponível.');
      return;
    }

    const phoneNumber = anunciante.telefone.replace(/\D/g, '');

    Alert.alert(
      'Contactar Anunciante',
      `Como deseja entrar em contato com ${anunciante.nome}?`,
      [
        {
          text: 'WhatsApp',
          onPress: async () => {
            const message = encodeURIComponent(`Olá, vi seu anúncio "${anuncio?.titulo}" e gostaria de mais informações.`);
            
            const whatsappUrls = [
              `whatsapp://send?phone=55${phoneNumber}&text=${message}`,
              `https://wa.me/55${phoneNumber}?text=${message}`,
              `https://api.whatsapp.com/send?phone=55${phoneNumber}&text=${message}`,
            ];

            let opened = false;
            for (const url of whatsappUrls) {
              try {
                const canOpen = await Linking.canOpenURL(url);
                if (canOpen) {
                  await Linking.openURL(url);
                  opened = true;
                  break;
                }
              } catch (err) {
                console.log(`Falhou com URL: ${url}`, err);
              }
            }

            if (!opened) {
              Alert.alert(
                'WhatsApp não encontrado',
                'Deseja abrir no navegador?',
                [
                  { text: 'Sim', onPress: () => Linking.openURL(`https://web.whatsapp.com/send?phone=55${phoneNumber}&text=${message}`) },
                  { text: 'Não', style: 'cancel' },
                ]
              );
            }
          },
        },
        {
          text: 'Ligar',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber}`).catch(err => 
              Alert.alert('Erro', 'Não foi possível abrir o discador.')
            );
          },
        },
        {
          text: 'Copiar Número',
          onPress: async () => {
            await Clipboard.setStringAsync(phoneNumber); // <-- API do Expo
            Toast.show({
              type: 'success',
              text1: 'Número Copiado! 📋',
              text2: phoneNumber,
            });
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const renderModalComentario = () => (
    <Modal
      visible={mostrarModalComentario}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setMostrarModalComentario(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setMostrarModalComentario(false)}>
            <MaterialCommunityIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Novo Comentário</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalContent}>
          <TextInput
            style={styles.modalInput}
            placeholder="Título do comentário"
            value={comentarioTitulo}
            onChangeText={setComentarioTitulo}
            maxLength={100}
          />

          <TextInput
            style={[styles.modalInput, styles.modalTextarea]}
            placeholder="Descreva sua opinião..."
            value={comentarioTexto}
            onChangeText={setComentarioTexto}
            multiline
            numberOfLines={6}
            maxLength={500}
          />

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Avaliação:</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setComentarioRating(star)}
                >
                  <Text style={[
                    styles.star,
                    { color: star <= comentarioRating ? '#FFD700' : '#ccc' }
                  ]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.modalSubmitButton}
            onPress={criarComentario}
          >
            <Text style={styles.modalSubmitText}>Enviar Comentário</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // MODAL DE EDIÇÃO:
  const renderModalEdicaoComentario = () => (
    <Modal
      visible={mostrarModalEdicao}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setMostrarModalEdicao(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setMostrarModalEdicao(false)}>
            <MaterialCommunityIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Editar Comentário</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalContent}>
          <TextInput
            style={styles.modalInput}
            placeholder="Título"
            value={editandoTitulo}
            onChangeText={setEditandoTitulo}
          />

          <TextInput
            style={[styles.modalInput, styles.modalTextarea]}
            placeholder="Descrição"
            value={editandoTexto}
            onChangeText={setEditandoTexto}
            multiline
            numberOfLines={6}
          />

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Avaliação:</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setEditandoRating(star)}
                >
                  <Text style={[
                    styles.star,
                    { color: star <= editandoRating ? '#FFD700' : '#ccc' }
                  ]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.modalSubmitButton}
            onPress={salvarEdicaoComentario}
          >
            <Text style={styles.modalSubmitText}>Salvar Edição</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
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
          data={comentariosParaExibir} // <-- USE comentariosParaExibir
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
                      <TextInput
                        style={styles.input}
                        placeholder="Área Construída (m²)"
                        value={formAreaConstruida}
                        onChangeText={setFormAreaConstruida}
                        keyboardType="numeric"
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Área do Terreno (m²)"
                        value={formAreaTerreno}
                        onChangeText={setFormAreaTerreno}
                        keyboardType="numeric"
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Ano de Construção"
                        value={formAnoConstrucao}
                        onChangeText={setFormAnoConstrucao}
                        keyboardType="numeric"
                      />
                      <View style={styles.pickerContainer}>
                        <Text style={styles.pickerLabel}>Padrão de Acabamento:</Text>
                        <View style={styles.radioGroup}>
                          {['Simples', 'Médio', 'Alto', 'Premium'].map((opcao) => (
                            <TouchableOpacity
                              key={opcao}
                              style={[
                                styles.radioButton,
                                formPadraoAcabamento === opcao && styles.radioButtonSelected
                              ]}
                              onPress={() => setFormPadraoAcabamento(opcao)}
                            >
                              <Text style={[
                                styles.radioText,
                                formPadraoAcabamento === opcao && styles.radioTextSelected
                              ]}>
                                {opcao}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                      <View style={styles.pickerContainer}>
                        <Text style={styles.pickerLabel}>Tipo de Imóvel:</Text>
                        <View style={styles.radioGroup}>
                          {['Apartamento', 'Casa'].map((tipo) => (
                            <TouchableOpacity
                              key={tipo}
                              style={[
                                styles.radioButton,
                                formTipoImovel === tipo && styles.radioButtonSelected
                              ]}
                              onPress={() => setFormTipoImovel(tipo)}
                            >
                              <Text style={[
                                styles.radioText,
                                formTipoImovel === tipo && styles.radioTextSelected
                              ]}>
                                {tipo}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.priceText}>
                        R$ {anuncio?.preco ? anuncio.preco.toLocaleString('pt-BR') : '0'}
                      </Text>
                      <Text style={styles.descriptionText}>
                        {anuncio?.descricao || 'Sem descrição'}
                      </Text>
                      {!isEditing && anuncio && (
                        <View style={styles.mlDataSection}>
                          <Text style={styles.sectionTitle}>Características do Imóvel</Text>
                          {(anuncio as any).area_construida && (
                            <View style={styles.mlDataRow}>
                              <MaterialCommunityIcons name="floor-plan" size={20} color="#137fec" />
                              <Text style={styles.mlDataText}>Área Construída: {(anuncio as any).area_construida} m²</Text>
                            </View>
                          )}
                          {(anuncio as any).area_terreno && (
                            <View style={styles.mlDataRow}>
                              <MaterialCommunityIcons name="texture-box" size={20} color="#137fec" />
                              <Text style={styles.mlDataText}>Área do Terreno: {(anuncio as any).area_terreno} m²</Text>
                            </View>
                          )}
                          {(anuncio as any).ano_construcao && (
                            <View style={styles.mlDataRow}>
                              <MaterialCommunityIcons name="calendar" size={20} color="#137fec" />
                              <Text style={styles.mlDataText}>Ano: {(anuncio as any).ano_construcao}</Text>
                            </View>
                          )}
                          {(anuncio as any).padrao_acabamento && (
                            <View style={styles.mlDataRow}>
                              <MaterialCommunityIcons name="star" size={20} color="#137fec" />
                              <Text style={styles.mlDataText}>Padrão: {(anuncio as any).padrao_acabamento}</Text>
                            </View>
                          )}
                          {(anuncio as any).tipo_imovel && (
                            <View style={styles.mlDataRow}>
                              <MaterialCommunityIcons name="home" size={20} color="#137fec" />
                              <Text style={styles.mlDataText}>Tipo: {(anuncio as any).tipo_imovel}</Text>
                            </View>
                          )}
                          {(anuncio as any).cluster !== undefined && (
                            <View style={styles.mlDataRow}>
                              <MaterialCommunityIcons name="chart-bubble" size={20} color="#137fec" />
                              <Text style={styles.mlDataText}>Perfil ML: Cluster {(anuncio as any).cluster}</Text>
                            </View>
                          )}

                            <TouchableOpacity
                              style={styles.predictButton}
                              onPress={fetchPredictedLabel}
                              disabled={loadingLabel}
                            >
                              <Text style={styles.predictButtonText}>
                                {loadingLabel ? 'Gerando rótulo...' : 'Gerar rótulo do anúncio'}
                              </Text>
                            </TouchableOpacity>

                            {predictedLabel && (
                              <Text style={styles.predictedLabel}>
                                Rótulo do anúncio: <Text style={{ fontWeight: 'bold', color: 'green' }}>{predictedLabel}</Text>
                              </Text>
                            )}

                        </View>
                      )}
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
                      <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
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
                    {coords && coords.latitude && coords.longitude ? (
                      <MapView
                        style={styles.mapImage}
                        initialRegion={{
                          latitude: coords.latitude,
                          longitude: coords.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                      >
                        <Marker 
                          coordinate={{
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                          }} 
                        />
                      </MapView>
                    ) : (
                      <View style={styles.mapPlaceholder}>
                        <MaterialCommunityIcons name="map-outline" size={40} color="#ccc" />
                        <Text style={styles.noMapText}>Mapa não disponível</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Comentários</Text>
              </View>
            </View>
          }
          renderItem={({ item }: { item: Comentario }) => (
            <View style={styles.comentarioCard}>
              <View style={styles.comentarioHeader}>
                <Image
                  source={{ uri: item.userPhoto || item.userAvatar || 'https://via.placeholder.com/40' }}
                  style={styles.comentarioAvatar}
                />
                <View style={{ flex: 1 }}>
                  {/* TÍTULO */}
                  <Text style={styles.comentarioTitulo}>{item.titulo}</Text>
                  
                  {/* USUÁRIO */}
                  <Text style={styles.comentarioUser}>{item.userName}</Text>
                  
                  {/* RATING COM ESTRELAS */}
                  <View style={styles.ratingRow}>
                    <Text style={styles.rating}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</Text>
                    <Text style={styles.ratingText}>({item.rating}/5)</Text>
                  </View>
                </View>
              </View>
              
              {/* DESCRIÇÃO/TEXTO */}
              <Text style={styles.comentarioDescricao}>{item.texto || item.descricao}</Text>
              
              {/* BOTÕES DE EDITAR E DELETAR */}
              {item.userId === currentUser?.uid && (
                <View style={styles.comentarioActions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => iniciarEdicaoComentario(item)}
                  >
                    <MaterialCommunityIcons name="pencil" size={18} color="#007AFF" />
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteButtonStyle}
                    onPress={() => deletarComentario(item.id)}
                  >
                    <MaterialCommunityIcons name="trash-can" size={18} color="#FF3B30" />
                    <Text style={styles.deleteButtonText}>Deletar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListFooterComponent={
            <View style={{ paddingHorizontal: 16, paddingBottom: 120 }}>
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

      {/* ADICIONE ESTE FAB PARA COMENTÁRIOS */}
      {!isEditing && anuncioId && (
        <TouchableOpacity 
          style={[styles.fab, styles.fabComment]}
          onPress={() => setMostrarModalComentario(true)}
        >
          <MaterialCommunityIcons name="message-plus" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {renderModalComentario()}
      {renderModalEdicaoComentario()}

      <BottomNav />
      <Toast />
    </SafeAreaView>
  );
}

// ADICIONE ESTE ESTILO:
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
  fabComment: {
    bottom: 220, // <-- DIFERENTE DO FAB DE EDIÇÃO
    backgroundColor: '#28a745',
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
  commentSend: { 
    marginLeft: 8, 
    backgroundColor: "#007AFF", 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 8 
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
    marginTop: 12,
  },
  anuncianteAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  anuncianteTextContainer: {
    flex: 1,
  },
  anuncianteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  anuncianteContato: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  contactButton: {
    backgroundColor: '#137fec',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  noMapText: { // <-- ADICIONE este estilo
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    backgroundColor: '#137fec',
    borderColor: '#137fec',
  },
  radioText: {
    fontSize: 14,
    color: '#374151',
  },
  radioTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  mlDataSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  mlDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  mlDataText: {
    fontSize: 15,
    color: '#374151',
  },

  predictButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center'
  },
  predictButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  predictedLabel: {
    marginTop: 15,
    fontSize: 16
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  modalContent: {
    padding: 16,
    flex: 1,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalTextarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  star: {
    fontSize: 32,
  },
  modalSubmitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  comentarioCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  comentarioHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  comentarioTitulo: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  comentarioUser: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  rating: {
    color: '#FFD700',
    fontSize: 14,
  },
  comentarioDescricao: {
    fontSize: 13,
    color: '#333',
    marginBottom: 10,
    lineHeight: 18,
  },
  comentarioActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 12,
  },
  deleteButtonStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffe0e6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  comentarioAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
});