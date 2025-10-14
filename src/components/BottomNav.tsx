import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Buscar: undefined;
  Perfil: undefined;
  AnuncioDetail: { anuncioId: string };
};

type BottomNavNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BottomNav() {
  const navigation = useNavigation<BottomNavNavigationProp>();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Buscar')}>
        <Text style={styles.navIcon}>🔍</Text>
        <Text style={styles.navLabel}>Search</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.navItem]} onPress={() => navigation.navigate('Home')}>
        <Text style={[styles.navIcon, { color: "#137fec" }]}>🏠</Text>
        <Text style={[styles.navLabel, { color: "#137fec" }]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Perfil')}>
        <Text style={styles.navIcon}>👤</Text>
        <Text style={styles.navLabel}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    height: 64,
    backgroundColor: "#f6f7f8",
  },
  navItem: { alignItems: "center" },
  navIcon: { fontSize: 20, color: "#6b7280" },
  navLabel: { fontSize: 12, color: "#6b7280" },
});
