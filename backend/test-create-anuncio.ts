import fetch from 'node-fetch';

const testCreateAnuncio = async () => {
  const url = "http://localhost:3000/anuncios";
  const anuncioData = {
    titulo: "Apartamento Espaçoso no Centro",
    descricao: "Belo apartamento com 3 quartos e vista para a cidade.",
    preco: 750000,
    imageUrl: "https://example.com/apartment.jpg",
  };
  const userId = "testUserId123"; // Use um ID de usuário de teste

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ anuncioData, userId }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Anúncio criado com sucesso:", data);
    } else {
      console.error("Erro ao criar anúncio:", data);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
};

testCreateAnuncio();
