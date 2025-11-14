import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider } from './src/contexts/UserContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import Login from './src/views/Login';
import Cadastro from './src/views/Cadastro';
import Home from './src/views/Home';
import Buscar from './src/views/Buscar';
import Perfil from './src/views/Perfil';
import RedefinirSenha from './src/views/Redefinirsenha';
import AnuncioDetail from './src/views/AnuncioDetail';
import EditarPerfil from './src/views/EditarPerfil'; // ajuste o caminho se necessário
import { RootStackParamList } from './src/types/navigation';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <UserProvider>
      <FavoritesProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Cadastro" component={Cadastro} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Buscar" component={Buscar} />
            <Stack.Screen name="Perfil" component={Perfil} />
            <Stack.Screen name="RedefinirSenha" component={RedefinirSenha} />
            <Stack.Screen name="AnuncioDetail" component={AnuncioDetail} />
            <Stack.Screen name="EditarPerfil" component={EditarPerfil} />
          </Stack.Navigator>
          <Toast />
        </NavigationContainer>
      </FavoritesProvider>
    </UserProvider>
  );
}

