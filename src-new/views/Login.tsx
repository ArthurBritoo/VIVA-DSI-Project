import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserContext } from '../contexts/UserContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../assets/firebaseConfig';

type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Home: undefined;
  RedefinirSenha: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginProps {
  navigation: LoginScreenNavigationProp;
}

export default function Login({ navigation }: LoginProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [senhaError, setSenhaError] = useState(false);
  const { setCurrentUser } = useUserContext(); // Only need setCurrentUser for manual update if necessary, but onAuthStateChanged handles it

  const handleLogin = async () => {
    setEmailError(false);
    setSenhaError(false);

    if (!email) {
      setEmailError(true);
    }
    if (!senha) {
      setSenhaError(true);
    }

    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      // User is signed in. The onAuthStateChanged listener in UserContext will handle setting the currentUser.
      Alert.alert('Login realizado', `Bem-vindo!`);
      navigation.navigate('Home');//https://console.firebase.google.com/project/dsi-viva/authentication/users?hl=pt-br
    } catch (error: any) {
      let errorMessage = 'Ocorreu um erro ao fazer login. Tente novamente.';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Usuário desativado.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Credenciais inválidas. Verifique seu email e senha.';
      }
      Alert.alert('Erro de Login', errorMessage);
      console.error("Login Error:", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => Alert.alert("Back pressed")}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login</Text>
      </View>

      {/* Main */}
      <View style={styles.main}>
        <Image source={require('../../assets/logo_transparente.png')} style={{ width: 120, height: 120, marginBottom: 30 }} resizeMode="contain" />
        <TextInput
          style={[styles.input, emailError && styles.inputError]}
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        {emailError && <Text style={styles.errorMessage}>Campo obrigatório*</Text>}
        <TextInput
          style={[styles.input, senhaError && styles.inputError, { marginBottom: 16 } ]}
          placeholder="Senha"
          placeholderTextColor="#9ca3af"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
        {senhaError && <Text style={styles.errorMessage}>Campo obrigatório*</Text>}
        <TouchableOpacity onPress={() => navigation.navigate('RedefinirSenha')}>
          <Text style={styles.forgotPassword}>Esqueci a senha?</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
          <Text style={styles.signInText}>Entrar</Text>
        </TouchableOpacity>

        <Text style={styles.signUpText}>
          Não tem uma conta?{" "}
          <Text style={styles.signUpLink} onPress={() => navigation.navigate('Cadastro')}>Cadastre-se</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f7f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backArrow: {
    fontSize: 24,
    color: "#111",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    paddingRight: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", /* Added to centralize the image */
    paddingHorizontal: 24,
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
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorMessage: {
    color: 'red',
    alignSelf: 'flex-start',
    marginLeft: "10%",
    marginBottom: 5,
    marginTop: -10,
  },
  forgotPassword: {
    textAlign: "right",
    color: "#137fec",
    fontWeight: "500",
    fontSize: 14,
  },
  footer: {
    padding: 24,
  },
  signInButton: {
    backgroundColor: "#137fec",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  signUpText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
    color: "#4b5563",
  },
  signUpLink: {
    fontWeight: "bold",
    color: "#137fec",
  },
});
