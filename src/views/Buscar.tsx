import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header  from "../components/Header";
import BottomNav from "../components/BottomNav";

type RootStackParamList = {
  Home: undefined;
  Buscar: undefined;
  Perfil: undefined;
};

export default function Buscar() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.flexGrow}>
        <Header title="Buscar" onMenuPress={() => {}} />

        <View style={styles.container}>
            <Text style={styles.title}>Tela de Busca</Text>
        </View>

        {/* Menu de navegação */}
        <BottomNav/>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f8', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  
  flexGrow: {
    flexGrow: 1,
  },
});
