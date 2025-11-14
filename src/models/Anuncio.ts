// src/models/Anuncio.ts
export interface Anuncio {
    id?: string;
    titulo: string;
    descricao: string;
    preco: number;
    imageUrl: string;
    userId: string;
    createdAt?: Date;
  }
  