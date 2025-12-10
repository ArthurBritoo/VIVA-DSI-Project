export interface Endereco {
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
}

export interface Anuncio {
<<<<<<< HEAD
  id?: string;
  titulo: string;
  descricao: string;
  preco: number;
  imageUrl: string;
  userId: string;
  endereco?: Endereco;
  area_construida?: number;
  area_terreno?: number;
  ano_construcao?: number;
  padrao_acabamento?: string;
  tipo_imovel?: string;
  cluster?: number;
  prediction?: string;
}
=======
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
  
>>>>>>> cf9c1f2cecfc6cf5c9e3428ba82ae12755536cdb
