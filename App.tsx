import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider } from './src/contexts/UserContext';
import Login from './src/views/Login';
import Cadastro from './src/views/Cadastro';
import Home from './src/views/Home';
import Buscar from './src/views/Buscar';
import Perfil from './src/views/Perfil';
import RedefinirSenha from './src/views/Redefinirsenha';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="Login">
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Cadastro" component={Cadastro} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Buscar" component={Buscar} />
          <Stack.Screen name="Perfil" component={Perfil} />
          <Stack.Screen name="RedefinirSenha" component={RedefinirSenha} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}