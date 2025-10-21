import { AntDesign, EvilIcons, Feather } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type RootStackParamList = {
  Buscar: undefined;
  Home: undefined;
  Perfil: undefined;
};

const BottomNav = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList>>();

  const handlePress = (tabName: keyof RootStackParamList) => {
    navigation.navigate(tabName);
  };

  return (
    <View style={styles.navContainer}>
      <TouchableOpacity style={styles.navItem} onPress={() => handlePress('Buscar')}>
        <EvilIcons
          name="search"
          size={30}
          style={[styles.navIcon, route.name === 'Buscar' && styles.activeIcon]}
        />
        <Text style={[styles.navLabel, route.name === 'Buscar' && styles.activeLabel]}>
          Buscar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => handlePress('Home')}>
        <AntDesign
          name="home"
          size={25}
          style={[styles.navIcon, route.name === 'Home' && styles.activeIcon]}
        />
        <Text style={[styles.navLabel, route.name === 'Home' && styles.activeLabel]}>
          Início
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => handlePress('Perfil')}>
        <Feather
          name="user"
          size={24}
          style={[styles.navIcon, route.name === 'Perfil' && styles.activeIcon]}
        />
        <Text style={[styles.navLabel, route.name === 'Perfil' && styles.activeLabel]}>
          Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    color: '#6b7280',
  },
  navLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  activeIcon: {
    color: '#137fec',
  },
  activeLabel: {
    color: '#137fec',
  },
});

export default BottomNav;
