// ✏️ Personalize tudo aqui antes de compartilhar o site!

const CONFIG = {
  casal: {
    nome1: "Marcos",
    nome2: "Amor",
    fotoCapa: "assets/images/casal-capa.jpg",
    fotoSobre: "assets/images/casal-sobre.jpg",
    dataInicio: "2023-06-12", // formato YYYY-MM-DD
  },

  musica: {
    titulo: "Nossa Música",
    artista: "Você & Eu",
    duracao: "3:42",
    // Coloque um arquivo .mp3 em assets/audio/ ou use uma URL externa
    audioUrl: "assets/audio/nossa-musica.mp3",
    capa: "assets/images/casal-capa.jpg",
  },

  sobre: {
    titulo: "Sobre nós",
    subtitulo: "A história por trás da faixa",
    descricao:
      "Dois corações que encontraram o mesmo ritmo. Cada dia ao seu lado é como descobrir uma nova música favorita — impossível de tirar do repeat.",
    mensagemEspecial: `Cada verso que eu escreveria pra você
começaria com um obrigado por existir.

Você transformou dias comuns em refrões
que eu quero cantar pelo resto da vida.

Se o amor tivesse uma playlist,
você seria a faixa que eu nunca pularia.

Obrigado por ser minha pessoa favorita,
minha calma e minha aventura ao mesmo tempo.

Te amo hoje, amanhã e em todas as estações. ♥`,
  },

  retrospectiva: {
    slides: [
      {
        tipo: "intro",
        titulo: "Nossa Retrospectiva",
        subtitulo: "O álbum do nosso amor",
        emoji: "💚",
      },
      {
        tipo: "contador",
        titulo: "Juntos há",
        label: "horas de amor",
        emoji: "⏱️",
      },
      {
        tipo: "contador-dias",
        titulo: "Isso são",
        label: "dias incríveis",
        emoji: "📅",
      },
      {
        tipo: "frase",
        titulo: "Nossa faixa favorita?",
        texto: "Você. Sempre você.",
        emoji: "🎵",
      },
      {
        tipo: "carrossel",
        titulo: "Memórias em alta",
        subtitulo: "Os melhores momentos do nosso álbum",
        fotos: [
          { src: "assets/images/foto1.jpg", legenda: "Nosso primeiro encontro" },
          { src: "assets/images/foto2.jpg", legenda: "Aquele dia perfeito" },
          { src: "assets/images/foto3.jpg", legenda: "Rindo juntos" },
          { src: "assets/images/foto4.jpg", legenda: "Mais um capítulo" },
        ],
      },
      {
        tipo: "timeline",
        titulo: "Nossa linha do tempo",
        subtitulo: "Cada data, uma música nova",
        eventos: [
          { data: "12 Jun 2023", titulo: "O começo", descricao: "O dia em que tudo começou" },
          { data: "15 Ago 2023", titulo: "Primeira viagem", descricao: "Descobrindo o mundo juntos" },
          { data: "25 Dez 2023", titulo: "Primeiro Natal", descricao: "Família, amor e risadas" },
          { data: "14 Fev 2024", titulo: "Dia dos Namorados", descricao: "Celebrando nosso amor" },
          { data: "Hoje", titulo: "Agora", descricao: "Escrevendo novas páginas juntos" },
        ],
      },
      {
        tipo: "roleta",
        titulo: "Onde vamos sair hoje?",
        subtitulo: "Gire a roleta e deixe o destino decidir",
        locais: [
          "🍕 Pizzaria",
          "🎬 Cinema",
          "🌳 Parque",
          "☕ Cafeteria",
          "🍣 Restaurante japonês",
          "🏖️ Praia",
          "🎳 Boliche",
          "🛍️ Shopping",
          "🌅 Pôr do sol",
          "🎡 Parque de diversões",
          "🍦 Sorveteria",
          "🎤 Karaokê",
        ],
      },
      {
        tipo: "final",
        titulo: "Obrigado por ser você",
        subtitulo: "Te amo infinitamente ♥",
        emoji: "💕",
      },
    ],
  },
};
