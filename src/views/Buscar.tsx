import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";

type RootStackParamList = {
  Home: undefined;
  Buscar: undefined;
  Perfil: undefined;
};

export default function Buscar() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flexGrow}>
        <Header title="Buscar" onMenuPress={() => { }} />

        <View style={styles.container}>
          
        </View>

        {/* Menu de navegação */}
        <BottomNav />
      </View>
    </SafeAreaView>
    
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7f8" },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  
  flexGrow: {
    flexGrow: 1,
  },
});
