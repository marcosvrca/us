// ✏️ Personalize tudo aqui antes de compartilhar o site!

const CONFIG = {
  casal: {
    nome1: "Marcos",
    nome2: "Amor",
    fotoCapa: "assets/images/foto_nossa_musica.jpeg",
    fotoSobre: "assets/images/foto_sobre_nos.jpeg",
    dataInicio: "2022-09-25", // formato YYYY-MM-DD
  },

  musica: {
    titulo: "Nossa Música",
    artista: "Você & Eu",
    duracao: "3:42",
    // Coloque um arquivo .mp3 em assets/audio/ ou use uma URL externa
    audioUrl: "assets/audio/nossa-musica.mp3",
    capa: "assets/images/foto_nossa_musica.jpeg",
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
        tipo: "pergunta-horas",
        texto: "Sabe quantas horas estamos juntos?",
        emoji: "⏳",
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
          { src: "assets/images/foto_carrossel_1.jpeg", legenda: "Nosso primeiro encontro" },
          { src: "assets/images/foto_carrossel_2.jpeg", legenda: "Aquele dia perfeito" },
          { src: "assets/images/foto_carrossel_3.jpeg", legenda: "Rindo juntos" },
          { src: "assets/images/foto_carrossel_4.png", legenda: "Mais um capítulo" },
        ],
      },
      {
        tipo: "surpresa-timeline",
        emoji: "🎁",
        linhas: [
          "Psst...",
          "Tenho uma surpresa pra você!",
          "Vamos reviver nossa história juntos?",
        ],
        hint: "Prepare o coração...",
      },
      {
        tipo: "timeline",
        titulo: "Nossa linha do tempo",
        subtitulo: "Cada data, uma música nova",
        pastaImagens: "assets/images",
      },
      {
        tipo: "surpresa-roleta",
        emoji: "🎲",
        linhas: [
          "Ainda não acabou...",
          "Tenho mais uma surpresa pra você!",
          "Vamos deixar o destino decidir?",
        ],
        hint: "Gire a roleta e descubra...",
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
