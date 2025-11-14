// src/models/Anuncio.ts
export interface Anuncio {
    id?: string;
    titulo: string;
    descricao: string;
    preco: number;
    imageUrl: string;
    userId: string;
    createdAt?: Date;
    endereco?: {
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
        latitude?: number;
        longitude?: number;
    };
  }
  