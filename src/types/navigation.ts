// src/types/navigation.ts
export type RootStackParamList = {
    Login: undefined;
    Cadastro: undefined;
    Home: undefined;
    Buscar: undefined;
    Perfil: undefined;
    RedefinirSenha: undefined;
    AnuncioDetail: { anuncioId?: string }; // Made anuncioId optional
    EditarPerfil: undefined;
  };
  