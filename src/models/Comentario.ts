export interface Comentario {
  id: string;
  anuncioId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  userAvatar?: string; // <-- ADICIONE
  titulo: string;
  descricao: string;
  texto?: string; // compatibilidade
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}