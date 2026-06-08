# 💚 Retrospectiva do Dia dos Namorados

Site romântico com tema Spotify para celebrar o amor do casal.

## Como usar

1. Abra o arquivo `index.html` **no celular** (ou simule mobile no navegador com F12 → modo dispositivo)
2. Personalize tudo em `js/config.js`

O site é **100% mobile-first**: no desktop aparece centralizado como um app de celular.

## Personalização

Edite `js/config.js` com os dados do casal:

| Campo | O que colocar |
|-------|---------------|
| `casal.nome1` / `nome2` | Nomes do casal |
| `casal.dataInicio` | Data que começaram (YYYY-MM-DD) |
| `casal.fotoCapa` | Foto para a capa do "álbum" |
| `casal.fotoSobre` | Foto na seção Sobre |
| `musica.titulo` / `artista` | Nome da música e artista |
| `musica.audioUrl` | Arquivo `.mp3` em `assets/audio/` |
| `sobre.mensagemEspecial` | Texto especial (como se fosse a letra) |
| `retrospectiva.slides` | Slides, fotos, timeline e locais da roleta |

### Fotos

Coloque suas fotos em `assets/images/`:
- `casal-capa.jpg` — capa do player
- `casal-sobre.jpg` — seção Sobre
- `foto1.jpg`, `foto2.jpg`, etc. — carrossel

### Música

Coloque o arquivo MP3 em `assets/audio/nossa-musica.mp3` (ou altere o caminho no config).

## Estrutura do site

1. **Player Spotify** — Tela inicial com foto do casal, controles de play/pause e barra de progresso
2. **Sobre** — Role para baixo para ver informações do casal e a mensagem especial
3. **Retrospectiva** — Estilo Spotify Wrapped com:
   - Contagem de horas e dias juntos
   - Carrossel de fotos
   - Linha do tempo
   - Roleta "Onde vamos sair hoje?"
   - Animações e avanço por toque

## Dica

Para compartilhar, hospede gratuitamente no [Netlify Drop](https://app.netlify.com/drop) ou [GitHub Pages](https://pages.github.com/) — basta arrastar a pasta do projeto.
