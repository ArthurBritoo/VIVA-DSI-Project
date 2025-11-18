// src/models/Anuncio.ts
export interface Anuncio {
    id?: string;
    titulo: string;
    descricao: string;
    preco: number;
    imageUrl: string;
    userId: string;
    createdAt?: Date;
    
    // ⭐ NOVOS CAMPOS PARA ML
    area_construida?: number;      // Área construída em m²
    area_terreno?: number;         // Área do terreno em m²
    ano_construcao?: number;       // Ano de construção
    padrao_acabamento?: string;    // Ex: "Alto", "Médio", "Simples"
    tipo_imovel?: string;          // Ex: "Apartamento", "Casa"
    
    // Campo calculado automaticamente
    cluster?: number;              // ID do cluster ML (0-4)
    score_recomendacao?: number;   // Score de relevância (0-100)
    
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