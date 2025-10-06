import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../assets/firebaseConfig";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { IconButton } from 'react-native-paper';


type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Home: undefined;
  RedefinirSenha: undefined;
};

type RedefinirSenhaScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RedefinirSenha'>;

interface RedefinirSenhaProps {
  navigation: RedefinirSenhaScreenNavigationProp;
}

export default function Redefinirsenha({ navigation }: RedefinirSenhaProps) {
  const [email, setEmail] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  

  const handleRedefinir = async () => {
    
    if (!email) {
      Alert.alert('Erro', 'Por favor, preencha o campo de e-mail.');
      return;
    }

    setLoading(true);
    setShowSuccessMessage(false); // Hide any previous success message

    try {
      await sendPasswordResetEmail(auth, email);
      setShowSuccessMessage(true);
      
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Redefinir Senha</Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {!showSuccessMessage && (
          <Image 
            source={require('../../assets/logo_transparente.png')} 
            style={styles.logo}
            resizeMode="contain" 
          />
        )}

        {showSuccessMessage ? (
          <View style={styles.successContainer}>
            <IconButton
              icon="check-circle"
              size={40}
              iconColor="green"
            />
            <Text style={styles.successText}>Um e-mail de redefinição de senha foi enviado para o seu endereço de e-mail.</Text>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.title}>Redefinir sua Senha</Text>
            <Text style={styles.instructionText}>Por favor, insira seu e-mail para redefinir sua senha.</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
            <TouchableOpacity style={styles.redefinirButton} onPress={handleRedefinir} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.redefinirButtonText}>Redefinir Senha</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signUpText}>
            Lembrou da senha?{" "}
            <Text style={styles.signUpLink}>Faça login</Text>
          </Text>
        </TouchableOpacity>
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
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 20,
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
  footer: {
    padding: 24,
  },
  redefinirButton: {
    backgroundColor: "#137fec",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  redefinirButtonText: {
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  successText: {
    fontSize: 20,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
});