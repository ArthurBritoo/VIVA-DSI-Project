import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserContext } from '../contexts/UserContext';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../assets/firebaseConfig';

type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Home: undefined;
};

type CadastroScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Cadastro'
>;

interface CadastroProps {
  navigation: CadastroScreenNavigationProp;
}

export default function Cadastro({ navigation }: CadastroProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [repitaSenha, setRepitaSenha] = useState('');

  const handleCadastro = async () => {
    if (!nome || !email || !telefone || !senha || !repitaSenha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    if (senha !== repitaSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Store additional user profile information in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        nome: nome,
        email: email,
        telefone: telefone,
        createdAt: new Date(),
      });

      Alert.alert('Sucesso', 'Cadastro realizado!');
      navigation.navigate('Login');
    } catch (error: any) {
      let errorMessage = 'Ocorreu um erro ao cadastrar. Tente novamente.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'O email já está em uso por outra conta.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'O formato do email é inválido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      }
      Alert.alert('Erro de Cadastro', errorMessage);
      console.error("Registration Error:", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header com botão de fechar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Image
          source={require('../../assets/logo_transparente.png')}
          style={{ width: 120, height: 120, marginBottom: 12, alignSelf: 'center' }}
          resizeMode="contain"
        />
        <Text style={styles.title}>Crie sua conta</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#9ca3af"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Telefone"
          placeholderTextColor="#9ca3af"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#9ca3af"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Repita a Senha"
          placeholderTextColor="#9ca3af"
          value={repitaSenha}
          onChangeText={setRepitaSenha}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleCadastro}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Já tem uma conta?{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Entrar
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f6f7f8',
    justifyContent: 'space-between',
    padding: 16,
  },
  header: {
    alignItems: 'flex-end',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: "100%",
    height: 56,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#111",
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#137fec",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
  },
  link: {
    color: '#137fec',
    fontWeight: '500',
  },
});
