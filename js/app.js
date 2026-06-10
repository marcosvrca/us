(function () {
  const BG_COLORS = ['bg-love-rose', 'bg-love-wine', 'bg-love-blush', 'bg-love-crimson', 'bg-love-lavender', 'bg-love-sunset'];
  const FX_HEARTS = ['♥', '💕', '💗', '❤️', '🤍', '💖'];
  const FX_SPARKLES = ['✦', '✧', '·', '♥'];
  const FX_COUNTS = {
    intro: 14, 'pergunta-horas': 12, contador: 10, 'contador-dias': 10, frase: 8,
    carrossel: 6, 'surpresa-timeline': 14, timeline: 5, 'surpresa-roleta': 12, roleta: 8, final: 18,
  };
  const ROULETTE_COLORS = ['#1db954', '#8b5cf6', '#ec4899', '#f97316', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#06b6d4', '#a855f7', '#f43f5e', '#14b8a6'];

  let currentSlide = 0;
  let isPlaying = false;
  let autoAdvanceTimer = null;
  let autoAdvanceState = { active: false, duration: 0, remaining: 0, pausedAt: 0, slideIndex: -1 };

  const audio = document.getElementById('audio-player');
  const bgmA = document.getElementById('bgm-a');
  const bgmB = document.getElementById('bgm-b');
  const BGM_FADE_MS = 2000;
  let bgmActive = 'a';
  let bgmCurrentUrl = null;
  let bgmFadeFrame = null;
  const playBtn = document.getElementById('play-btn');
  const progressFill = document.getElementById('progress-fill');
  const progressThumb = document.getElementById('progress-thumb');
  const progressBar = document.getElementById('progress-bar');
  const currentTimeEl = document.getElementById('current-time');
  const totalTimeEl = document.getElementById('total-time');
  const albumArt = document.getElementById('album-art');
  const retroSection = document.getElementById('retro-section');
  const retroSlides = document.getElementById('retro-slides');
  const retroProgressBars = document.getElementById('retro-progress-bars');

  function init() {
    setupBgm();
    setupPlayer();
    setupAbout();
    buildRetroSlides();
    setupRetroNavigation();
    setupScrollAnimations();
    preventZoom();
    startBgm(CONFIG.musicas.inicio);
  }

  function getActiveBgm() {
    return bgmActive === 'a' ? bgmA : bgmB;
  }

  function getInactiveBgm() {
    return bgmActive === 'a' ? bgmB : bgmA;
  }

  function setupBgm() {
    [bgmA, bgmB].forEach((el) => {
      el.volume = 0;
      el.loop = true;
    });
  }

  function unlockBgm() {
    const track = getActiveBgm();
    if (bgmCurrentUrl && track.paused) {
      track.play().catch(() => {});
    }
  }

  function startBgm(url) {
    if (!url) return;
    bgmCurrentUrl = url;
    bgmActive = 'a';
    bgmA.src = url;
    bgmA.volume = 1;
    bgmA.currentTime = 0;
    bgmA.play().then(() => {
      if (retroSection.classList.contains('hidden')) {
        isPlaying = true;
        updatePlayButton();
        albumArt.classList.add('playing');
      }
    }).catch(() => {
      const unlock = () => {
        bgmA.play().then(() => {
          if (retroSection.classList.contains('hidden')) {
            isPlaying = true;
            updatePlayButton();
            albumArt.classList.add('playing');
          }
        }).catch(() => {});
      };
      document.addEventListener('pointerdown', unlock, { once: true });
      document.addEventListener('click', unlock, { once: true });
    });
  }

  function crossfadeBgm(url) {
    if (!url || url === bgmCurrentUrl) return;

    if (bgmFadeFrame) cancelAnimationFrame(bgmFadeFrame);

    const from = getActiveBgm();
    const to = getInactiveBgm();
    const fromVol = from.paused ? 0 : from.volume;

    to.src = url;
    to.volume = 0;
    to.currentTime = 0;

    const startFade = () => {
      const start = performance.now();

      const step = (now) => {
        const t = Math.min((now - start) / BGM_FADE_MS, 1);
        const eased = t * t * (3 - 2 * t);
        to.volume = eased;
        if (!from.paused) from.volume = fromVol * (1 - eased);

        if (t < 1) {
          bgmFadeFrame = requestAnimationFrame(step);
        } else {
          from.pause();
          from.volume = 0;
          to.volume = 1;
          bgmActive = bgmActive === 'a' ? 'b' : 'a';
          bgmCurrentUrl = url;
          bgmFadeFrame = null;
        }
      };

      bgmFadeFrame = requestAnimationFrame(step);
    };

    to.play().then(startFade).catch(startFade);
  }

  function handleBgmForSlide(prevSlide, nextSlide, newIndex, oldIndex) {
    if (!CONFIG.musicas) return;

    if (nextSlide.tipo === 'surpresa-timeline' && newIndex !== oldIndex) {
      crossfadeBgm(CONFIG.musicas.memorias);
      return;
    }

    if (prevSlide && prevSlide.tipo === 'timeline' && newIndex > oldIndex) {
      crossfadeBgm(CONFIG.musicas.posTimeline);
    }
  }

  function preventZoom() {
    let lastTouch = 0;
    document.addEventListener('touchend', (e) => {
      if (e.target.closest('#retro-section, #retro-tap-overlay')) return;
      const now = Date.now();
      if (now - lastTouch < 300) e.preventDefault();
      lastTouch = now;
    }, { passive: false });
  }

  function vibrate(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  function setupPlayer() {
    const { musica } = CONFIG;

    document.getElementById('track-title').textContent = musica.titulo;
    document.getElementById('track-artist').textContent = musica.artista;
    albumArt.src = musica.capa;
    albumArt.onerror = () => { albumArt.src = placeholderImage('Nossa Música'); };
    totalTimeEl.textContent = musica.duracao;

    if (musica.audioUrl) {
      audio.src = musica.audioUrl;
      audio.onerror = () => console.warn('Áudio não encontrado. Adicione o arquivo em assets/audio/');
    }

    playBtn.addEventListener('click', togglePlay);
    document.getElementById('heart-btn').addEventListener('click', function () {
      this.classList.toggle('liked');
    });

    progressBar.addEventListener('click', seekAudio);
    progressBar.addEventListener('touchstart', onProgressTouch, { passive: false });
    progressBar.addEventListener('touchmove', onProgressTouch, { passive: false });
    audio.addEventListener('timeupdate', updateProgress);
    bgmA.addEventListener('timeupdate', updateProgress);
    bgmB.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', () => {
      totalTimeEl.textContent = formatTime(audio.duration);
    });
    const syncBgmDuration = (e) => {
      if (retroSection.classList.contains('hidden') && e.target === getActiveBgm()) {
        totalTimeEl.textContent = formatTime(e.target.duration);
      }
    };
    bgmA.addEventListener('loadedmetadata', syncBgmDuration);
    bgmB.addEventListener('loadedmetadata', syncBgmDuration);
    audio.addEventListener('ended', () => {
      isPlaying = false;
      updatePlayButton();
      albumArt.classList.remove('playing');
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
      const src = retroSection.classList.contains('hidden') ? getActiveBgm() : audio;
      src.currentTime = 0;
    });
    document.getElementById('next-btn').addEventListener('click', () => {
      const src = retroSection.classList.contains('hidden') ? getActiveBgm() : audio;
      src.currentTime = Math.min(src.currentTime + 10, src.duration || 0);
    });
  }

  function togglePlay() {
    if (!retroSection.classList.contains('hidden')) return;

    const bgm = getActiveBgm();
    unlockBgm();

    if (isPlaying) {
      bgm.pause();
      audio.pause();
      albumArt.classList.remove('playing');
    } else {
      if (!bgmCurrentUrl) startBgm(CONFIG.musicas.inicio);
      bgm.play().catch(() => {
        simulateProgress();
      });
      albumArt.classList.add('playing');
    }
    isPlaying = !isPlaying;
    updatePlayButton();
  }

  let simInterval = null;
  function simulateProgress() {
    clearInterval(simInterval);
    if (!isPlaying) return;

    let simTime = parseFloat(progressFill.style.width) / 100 * 222 || 0;
    simInterval = setInterval(() => {
      if (!isPlaying) { clearInterval(simInterval); return; }
      simTime += 1;
      const pct = (simTime / 222) * 100;
      progressFill.style.width = pct + '%';
      progressThumb.style.left = pct + '%';
      currentTimeEl.textContent = formatTime(simTime);
      if (simTime >= 222) {
        isPlaying = false;
        updatePlayButton();
        albumArt.classList.remove('playing');
        clearInterval(simInterval);
      }
    }, 1000);
  }

  function updatePlayButton() {
    playBtn.querySelector('.play-icon').classList.toggle('hidden', isPlaying);
    playBtn.querySelector('.pause-icon').classList.toggle('hidden', !isPlaying);
  }

  function updateProgress() {
    const source = !retroSection.classList.contains('hidden') ? audio : getActiveBgm();
    if (!source.duration) return;
    const pct = (source.currentTime / source.duration) * 100;
    progressFill.style.width = pct + '%';
    progressThumb.style.left = pct + '%';
    currentTimeEl.textContent = formatTime(source.currentTime);
    if (!retroSection.classList.contains('hidden')) return;
    isPlaying = !source.paused;
    updatePlayButton();
    albumArt.classList.toggle('playing', isPlaying);
  }

  function getProgressPct(clientX) {
    const rect = progressBar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }

  function seekAudio(e) {
    const pct = getProgressPct(e.clientX);
    applySeek(pct);
  }

  function onProgressTouch(e) {
    e.preventDefault();
    const touch = e.touches[0] || e.changedTouches[0];
    applySeek(getProgressPct(touch.clientX));
  }

  function applySeek(pct) {
    const source = !retroSection.classList.contains('hidden') ? audio : getActiveBgm();
    if (source.duration) {
      source.currentTime = pct * source.duration;
    } else if (audio.duration) {
      audio.currentTime = pct * audio.duration;
    } else {
      progressFill.style.width = (pct * 100) + '%';
      progressThumb.style.left = (pct * 100) + '%';
      currentTimeEl.textContent = formatTime(pct * 222);
    }
  }

  function formatTime(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + String(sec).padStart(2, '0');
  }

  function setupAbout() {
    const { sobre, casal } = CONFIG;

    document.getElementById('about-title').textContent = sobre.titulo;
    document.getElementById('about-subtitle').textContent = sobre.subtitulo;
    document.getElementById('about-desc').textContent = sobre.descricao;

    const aboutPhoto = document.getElementById('about-photo');
    aboutPhoto.src = casal.fotoSobre;
    aboutPhoto.onerror = () => { aboutPhoto.src = placeholderImage('Nós'); };

    const lyricsEl = document.getElementById('lyrics-text');
    const lines = sobre.mensagemEspecial.split('\n');
    lyricsEl.innerHTML = lines.map((line, i) =>
      `<div class="line" style="animation-delay:${i * 0.15}s">${line || '&nbsp;'}</div>`
    ).join('');

    document.getElementById('start-retro-btn').addEventListener('click', () => {
      crossfadeBgm(CONFIG.musicas.retrospectiva);
      openRetrospective();
    });
  }

  function getHoursTogether() {
    const start = new Date(CONFIG.casal.dataInicio + 'T00:00:00');
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60));
  }

  function getDaysTogether() {
    const start = new Date(CONFIG.casal.dataInicio + 'T00:00:00');
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  }

  function parseTimelineFilename(filename, pasta) {
    const name = filename.replace(/^.*[\\/]/, '').replace(/\.[^.]+$/i, '');
    const match = name.match(/^(\d{1,2})-(\d{1,2})-(\d{4})[_\s](.+)$/i);
    if (!match) return null;

    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    const descricao = match[4].replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    const titulo = descricao.charAt(0).toUpperCase() + descricao.slice(1);

    const src = filename.includes('/')
      ? filename
      : `${pasta}/${filename}`;

    return {
      data: `${day}/${month}/${year}`,
      titulo,
      src,
      sortKey: `${year}${month}${day}${filename}`,
    };
  }

  function getTimelineEventos(slide) {
    const pasta = slide.pastaImagens || 'assets/images';
    const lista = typeof TIMELINE_IMAGES !== 'undefined' ? TIMELINE_IMAGES : [];

    return lista
      .map((file) => parseTimelineFilename(file, pasta))
      .filter(Boolean)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }

  function buildRetroSlides() {
    const slides = CONFIG.retrospectiva.slides;
    retroSlides.innerHTML = '';
    retroProgressBars.innerHTML = '';

    slides.forEach((slide, i) => {
      const bar = document.createElement('div');
      bar.className = 'retro-progress-bar';
      bar.innerHTML = '<div class="retro-progress-fill"></div>';
      retroProgressBars.appendChild(bar);

      const el = document.createElement('div');
      const scrollable = slide.tipo === 'timeline';
      el.className = 'retro-slide retro-' + slide.tipo + ' ' + BG_COLORS[i % BG_COLORS.length] + (scrollable ? ' scrollable' : '');
      el.dataset.index = i;
      el.innerHTML = `
        <div class="slide-effects" aria-hidden="true"></div>
        <div class="slide-content">${renderSlide(slide)}</div>`;
      retroSlides.appendChild(el);
    });
  }

  function spawnSlideEffects(slideEl, tipo) {
    const container = slideEl.querySelector('.slide-effects');
    if (!container) return;
    container.innerHTML = '';

    const count = FX_COUNTS[tipo] || 6;
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('span');
      heart.className = 'fx-heart';
      heart.textContent = FX_HEARTS[i % FX_HEARTS.length];
      heart.style.left = (5 + Math.random() * 90) + '%';
      heart.style.animationDuration = (5 + Math.random() * 7) + 's';
      heart.style.animationDelay = (Math.random() * 4) + 's';
      heart.style.fontSize = (12 + Math.random() * 20) + 'px';
      heart.style.setProperty('--drift', (-20 + Math.random() * 40) + 'px');
      container.appendChild(heart);
    }

    if (tipo === 'intro' || tipo === 'final' || tipo === 'frase' || tipo === 'pergunta-horas' || tipo === 'surpresa-timeline' || tipo === 'surpresa-roleta') {
      for (let i = 0; i < 10; i++) {
        const spark = document.createElement('span');
        spark.className = 'fx-sparkle';
        spark.textContent = FX_SPARKLES[i % FX_SPARKLES.length];
        spark.style.left = (Math.random() * 100) + '%';
        spark.style.top = (Math.random() * 100) + '%';
        spark.style.animationDelay = (Math.random() * 2) + 's';
        spark.style.animationDuration = (1.5 + Math.random() * 2) + 's';
        container.appendChild(spark);
      }
    }

    if (tipo === 'final') {
      const burst = document.createElement('div');
      burst.className = 'fx-heart-burst';
      burst.textContent = '💕';
      container.appendChild(burst);
    }
  }

  function restartSlideAnimations(slideEl) {
    slideEl.querySelectorAll(
      '.slide-emoji, .slide-title, .slide-subtitle, .slide-text, .counter-display, .counter-label, .carousel-container, .timeline-container, .roulette-container, .spin-btn, .pergunta-scene, .pergunta-clock, .pw, .pergunta-dots, .surpresa-scene, .surpresa-gift, .surpresa-line, .surpresa-hint, .surpresa-spark, .frase-photo-wrap'
    ).forEach((el) => {
      el.style.animation = 'none';
      void el.offsetHeight;
      el.style.animation = '';
    });
  }

  function renderSlide(slide) {
    switch (slide.tipo) {
      case 'intro':
        return `
          <div class="slide-emoji">${slide.emoji}</div>
          <h2 class="slide-title">${slide.titulo}</h2>
          <p class="slide-subtitle">${slide.subtitulo}</p>`;

      case 'pergunta-horas': {
        const palavras = slide.texto.split(' ');
        const glowWords = new Set(['horas', 'juntos?']);
        return `
          <div class="pergunta-scene">
            <div class="pergunta-clock">${slide.emoji || '⏳'}</div>
            <p class="pergunta-text">
              ${palavras.map((p, i) => {
                const glow = glowWords.has(p) ? ' pw-glow' : '';
                return `<span class="pw${glow}" style="animation-delay:${0.4 + i * 0.35}s">${p}</span>`;
              }).join(' ')}
            </p>
            <p class="pergunta-dots" aria-hidden="true">
              <span style="animation-delay:2.4s">.</span><span style="animation-delay:2.55s">.</span><span style="animation-delay:2.7s">.</span>
            </p>
            <p class="pergunta-hint" style="animation-delay:3.2s">Vamos descobrir...</p>
          </div>`;
      }

      case 'contador':
        return `
          <div class="slide-emoji">${slide.emoji}</div>
          <h2 class="slide-title">${slide.titulo}</h2>
          <div class="counter-display" data-target="${getHoursTogether()}">0</div>
          <p class="counter-label">${slide.label}</p>`;

      case 'contador-dias':
        return `
          <div class="slide-emoji">${slide.emoji}</div>
          <h2 class="slide-title">${slide.titulo}</h2>
          <div class="counter-display" data-target="${getDaysTogether()}">0</div>
          <p class="counter-label">${slide.label}</p>`;

      case 'frase':
        return `
          <div class="slide-emoji">${slide.emoji}</div>
          <h2 class="slide-title">${slide.titulo}</h2>
          <p class="slide-text">${slide.texto}</p>
          ${slide.foto ? `
            <div class="frase-photo-wrap">
              <img class="frase-photo" src="${slide.foto}" alt="Nossa foto favorita" />
            </div>` : ''}`;

      case 'carrossel':
        return `
          <h2 class="slide-title">${slide.titulo}</h2>
          <p class="slide-subtitle">${slide.subtitulo}</p>
          <div class="carousel-container">
            <div class="carousel-stack">
              ${slide.fotos.map((f, i) => `
                <div class="carousel-card" data-index="${i}" data-caption="${f.legenda}">
                  <img src="${f.src}" alt="${f.legenda}" onerror="this.src='${placeholderImage('Foto ' + (i + 1))}'" />
                </div>
              `).join('')}
            </div>
            <p class="carousel-caption">${slide.fotos[0].legenda}</p>
            <p class="carousel-counter">1 / ${slide.fotos.length}</p>
            <p class="carousel-tap-hint">Toque na foto</p>
          </div>`;

      case 'surpresa-timeline':
      case 'surpresa-roleta':
        return `
          <div class="surpresa-scene surpresa-${slide.tipo}">
            <div class="surpresa-spark surpresa-spark-1">✨</div>
            <div class="surpresa-spark surpresa-spark-2">💕</div>
            <div class="surpresa-spark surpresa-spark-3">✨</div>
            <div class="surpresa-gift">${slide.emoji || '🎁'}</div>
            <div class="surpresa-lines">
              ${(slide.linhas || []).map((linha, i) => `
                <p class="surpresa-line${i === slide.linhas.length - 1 ? ' surpresa-line-glow' : ''}" style="animation-delay:${0.6 + i * 0.9}s">${linha}</p>
              `).join('')}
            </div>
            <p class="surpresa-hint" style="animation-delay:${0.6 + (slide.linhas || []).length * 0.9 + 0.6}s">${slide.hint || 'Prepare o coração...'}</p>
          </div>`;

      case 'timeline': {
        const eventos = slide.eventos || getTimelineEventos(slide);
        return `
          <h2 class="slide-title">${slide.titulo}</h2>
          <p class="slide-subtitle">${slide.subtitulo}</p>
          <div class="timeline-container">
            ${eventos.map((ev, i) => `
              <div class="timeline-item" style="animation-delay:${Math.min(i * 0.08, 2)}s">
                <img class="timeline-photo" src="${ev.src}" alt="${ev.titulo}" loading="lazy" />
                <span class="timeline-date">${ev.data}</span>
                <div class="timeline-content">
                  <h4>${ev.titulo}</h4>
                </div>
              </div>
            `).join('')}
          </div>`;
      }

      case 'roleta':
        return `
          <h2 class="slide-title">${slide.titulo}</h2>
          <p class="slide-subtitle">${slide.subtitulo}</p>
          <div class="roulette-container">
            <div class="roulette-pointer"></div>
            <canvas class="roulette-wheel" id="roulette-canvas"></canvas>
            <p class="roulette-result" id="roulette-result"></p>
            <button class="spin-btn" id="spin-btn">Girar!</button>
          </div>`;

      case 'final':
        return `
          <div class="slide-emoji">${slide.emoji}</div>
          <h2 class="slide-title">${slide.titulo}</h2>
          <p class="slide-subtitle">${slide.subtitulo}</p>`;

      default:
        return `<h2 class="slide-title">${slide.titulo || ''}</h2>`;
    }
  }

  function setupRetroNavigation() {
    const tapOverlay = document.getElementById('retro-tap-overlay');
    const pointer = { startX: 0, startY: 0, moved: false, active: false, downAt: 0 };

    document.getElementById('retro-close').addEventListener('click', closeRetrospective);

    function canHoldPause(target) {
      return !target.closest('.retro-close, .spin-btn, .carousel-container');
    }

    retroSection.addEventListener('pointerdown', (e) => {
      if (!canHoldPause(e.target)) return;
      pointer.startX = e.clientX;
      pointer.startY = e.clientY;
      pointer.moved = false;
      pointer.active = true;
      pointer.downAt = Date.now();
      pauseAutoAdvance();
      retroSection.classList.add('holding');
    });

    retroSection.addEventListener('pointermove', (e) => {
      if (!pointer.active) return;
      if (Math.abs(e.clientX - pointer.startX) > 10 || Math.abs(e.clientY - pointer.startY) > 10) {
        pointer.moved = true;
      }
    });

    function onPointerEnd(e) {
      if (!pointer.active) return;
      pointer.active = false;
      retroSection.classList.remove('holding');

      if (!canHoldPause(e.target)) {
        resumeAutoAdvance();
        return;
      }

      const holdDuration = Date.now() - pointer.downAt;
      const wasHold = holdDuration > 200 && !pointer.moved;

      if (!wasHold) {
        const swipeOnly = tapOverlay.classList.contains('disabled');
        handleRetroNavigation(e.clientX, pointer.startX, pointer.startY, e.clientY, pointer.moved, swipeOnly);
      }

      resumeAutoAdvance();
    }

    retroSection.addEventListener('pointerup', onPointerEnd);
    retroSection.addEventListener('pointercancel', () => {
      pointer.active = false;
      retroSection.classList.remove('holding');
      resumeAutoAdvance();
    });
  }

  function handleRetroNavigation(clientX, startX, startY, clientY, moved, swipeOnly) {
    const diffX = startX - clientX;
    const diffY = startY - clientY;
    const total = CONFIG.retrospectiva.slides.length;

    if (moved && Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0 && currentSlide < total - 1) goToSlide(currentSlide + 1);
      else if (diffX < 0 && currentSlide > 0) goToSlide(currentSlide - 1);
      return;
    }

    if (moved) return;

    const overlay = document.getElementById('retro-tap-overlay');
    const rect = overlay.getBoundingClientRect();
    const tapPct = (clientX - rect.left) / rect.width;

    if (tapPct < 0.3) {
      if (currentSlide > 0) goToSlide(currentSlide - 1);
      return;
    }

    if (swipeOnly) return;

    if (currentSlide < total - 1) goToSlide(currentSlide + 1);
  }

  function openRetrospective() {
    retroSection.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    currentSlide = 0;
    goToSlide(0);
    drawRoulette();
    unlockBgm();
  }

  function closeRetrospective() {
    retroSection.classList.add('hidden');
    retroSection.classList.remove('holding');
    document.body.style.overflow = '';
    clearAutoAdvance();
    crossfadeBgm(CONFIG.musicas.inicio);
  }

  function goToSlide(index) {
    const total = CONFIG.retrospectiva.slides.length;
    if (index < 0 || index >= total) return;

    const slides = retroSlides.querySelectorAll('.retro-slide');
    const direction = index > currentSlide ? 'exit-left' : 'exit-right';

    slides.forEach((s, i) => {
      s.classList.remove('active', 'exit-left', 'exit-right', 'entering');
      if (i === currentSlide && i !== index) s.classList.add(direction);
      if (i === index) {
        s.classList.add('active', 'entering');
        setTimeout(() => s.classList.remove('entering'), 700);
      }
    });

    const activeSlide = slides[index];
    const slideData = CONFIG.retrospectiva.slides[index];
    const prevSlideData = CONFIG.retrospectiva.slides[currentSlide];
    const oldIndex = currentSlide;

    spawnSlideEffects(activeSlide, slideData.tipo);
    restartSlideAnimations(activeSlide);

    updateProgressBars(index, slideData.tipo !== 'carrossel' && slideData.tipo !== 'timeline');
    currentSlide = index;
    handleBgmForSlide(prevSlideData, slideData, index, oldIndex);
    const isInteractive = ['carrossel', 'roleta', 'timeline'].includes(slideData.tipo);

    const tapOverlay = document.getElementById('retro-tap-overlay');
    tapOverlay.classList.toggle('disabled', isInteractive);

    const hint = document.querySelector('.retro-tap-hint');
    if (index === total - 1) {
      hint.style.display = 'none';
    } else {
      hint.style.display = 'block';
      if (slideData.tipo === 'carrossel') hint.textContent = 'Toque nas fotos para ver todas';
      else if (slideData.tipo === 'timeline') hint.textContent = 'Role até o final da linha do tempo';
      else if (slideData.tipo === 'roleta') hint.textContent = 'Gire a roleta · toque à esquerda para voltar';
      else if (isInteractive) hint.textContent = 'Deslize para o lado · segure para pausar';
      else hint.textContent = 'Toque para avançar · segure para pausar';
    }
    vibrate(12);

    if (slideData.tipo === 'contador' || slideData.tipo === 'contador-dias') {
      animateCounter(activeSlide.querySelector('.counter-display'));
    }

    if (slideData.tipo === 'carrossel') {
      setupCarousel(activeSlide);
    }

    if (slideData.tipo === 'roleta') {
      activeSlide.dataset.rouletteSpun = '';
      drawRoulette();
      setupRoulette(activeSlide);
    }

    if (slideData.tipo === 'timeline') {
      setupTimeline(activeSlide);
    }

    clearAutoAdvance();
    if (slideData.tipo === 'carrossel' || slideData.tipo === 'timeline') return;
    if (slideData.tipo !== 'roleta' && index < total - 1) {
      const delay = slideData.tipo === 'pergunta-horas' ? 6500
        : (slideData.tipo === 'surpresa-timeline' || slideData.tipo === 'surpresa-roleta') ? 7500
        : 10000;
      scheduleSlideAutoAdvance(delay);
    }
  }

  function enableRouletteAdvance(slideEl) {
    slideEl.dataset.rouletteSpun = '1';
    document.getElementById('retro-tap-overlay').classList.remove('disabled');

    const hint = document.querySelector('.retro-tap-hint');
    const total = CONFIG.retrospectiva.slides.length;
    if (hint && currentSlide < total - 1) {
      hint.style.display = 'block';
      hint.textContent = 'Toque à direita para avançar · segure para pausar';
    }

    if (currentSlide < total - 1) {
      scheduleSlideAutoAdvance(10000);
    }
  }

  function clearAutoAdvance() {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceState = { active: false, duration: 0, remaining: 0, pausedAt: 0, slideIndex: -1 };
  }

  function scheduleSlideAutoAdvance(delay) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceState = {
      active: true,
      duration: delay,
      remaining: delay,
      pausedAt: 0,
      slideIndex: currentSlide,
    };
    animateProgressBar(currentSlide, delay);
    autoAdvanceTimer = setTimeout(() => {
      if (currentSlide < CONFIG.retrospectiva.slides.length - 1) {
        goToSlide(currentSlide + 1);
      }
    }, delay);
  }

  function pauseAutoAdvance() {
    if (!autoAdvanceState.active || autoAdvanceState.pausedAt) return;

    clearTimeout(autoAdvanceTimer);

    const fills = retroProgressBars.querySelectorAll('.retro-progress-fill');
    const fill = fills[currentSlide];
    if (!fill) return;

    const bar = fill.parentElement;
    const currentWidth = fill.getBoundingClientRect().width;
    const totalWidth = bar.getBoundingClientRect().width;
    const pct = totalWidth > 0 ? (currentWidth / totalWidth) * 100 : 0;

    fill.style.transition = 'none';
    fill.style.width = pct + '%';

    autoAdvanceState.pausedAt = Date.now();
    autoAdvanceState.remaining = autoAdvanceState.duration * (1 - pct / 100);
  }

  function resumeAutoAdvance() {
    if (!autoAdvanceState.active || !autoAdvanceState.pausedAt) return;
    if (autoAdvanceState.slideIndex !== currentSlide) return;

    const remaining = autoAdvanceState.remaining;
    autoAdvanceState.pausedAt = 0;

    if (remaining <= 50) {
      if (currentSlide < CONFIG.retrospectiva.slides.length - 1) {
        goToSlide(currentSlide + 1);
      }
      return;
    }

    autoAdvanceState.remaining = remaining;
    const fills = retroProgressBars.querySelectorAll('.retro-progress-fill');
    const fill = fills[currentSlide];
    if (fill) {
      fill.style.transition = `width ${remaining}ms linear`;
      fill.style.width = '100%';
    }

    autoAdvanceTimer = setTimeout(() => {
      if (currentSlide < CONFIG.retrospectiva.slides.length - 1) {
        goToSlide(currentSlide + 1);
      }
    }, remaining);
  }

  function animateProgressBar(index, duration) {
    const fills = retroProgressBars.querySelectorAll('.retro-progress-fill');
    const fill = fills[index];
    if (!fill) return;
    fill.style.transition = 'none';
    fill.style.width = '0%';
    requestAnimationFrame(() => {
      fill.style.transition = `width ${duration}ms linear`;
      fill.style.width = '100%';
    });
  }

  function updateProgressBars(activeIndex, animateCurrent = true) {
    const fills = retroProgressBars.querySelectorAll('.retro-progress-fill');
    fills.forEach((fill, i) => {
      fill.classList.remove('done');
      fill.style.width = '0%';
      fill.style.transition = 'none';
      if (i < activeIndex) {
        fill.classList.add('done');
      } else if (i === activeIndex && animateCurrent) {
        requestAnimationFrame(() => {
          fill.style.transition = 'width 10s linear';
          fill.style.width = '100%';
        });
      }
    });
  }

  function onCarouselComplete(slideEl) {
    const tapHint = slideEl.querySelector('.carousel-tap-hint');
    const retroHint = document.querySelector('.retro-tap-hint');
    if (tapHint) {
      tapHint.textContent = 'Todas vistas! Avançando...';
      tapHint.classList.add('complete');
    }
    if (retroHint) retroHint.textContent = 'Avançando em instantes... · segure para pausar';
    scheduleSlideAutoAdvance(4000);
  }

  function isScrolledToBottom(el, threshold) {
    return el.scrollHeight - el.scrollTop - el.clientHeight <= (threshold || 48);
  }

  function checkTimelineEnd(slideEl) {
    if (slideEl.dataset.timelineComplete) return;
    if (!isScrolledToBottom(slideEl)) return;

    slideEl.dataset.timelineComplete = '1';
    onTimelineComplete(slideEl);
  }

  function onTimelineComplete(slideEl) {
    const retroHint = document.querySelector('.retro-tap-hint');
    const total = CONFIG.retrospectiva.slides.length;
    if (retroHint && currentSlide < total - 1) {
      retroHint.textContent = 'Fim da linha do tempo! Avançando... · segure para pausar';
    }
    scheduleSlideAutoAdvance(4000);
  }

  function setupTimeline(slideEl) {
    slideEl.scrollTop = 0;
    slideEl.dataset.timelineComplete = '';

    function check() {
      checkTimelineEnd(slideEl);
    }

    if (!slideEl.dataset.timelineReady) {
      slideEl.dataset.timelineReady = '1';
      slideEl.addEventListener('scroll', check, { passive: true });
    }

    slideEl.querySelectorAll('.timeline-photo').forEach((img) => {
      if (img.complete) return;
      img.addEventListener('load', check);
      img.addEventListener('error', check);
    });

    requestAnimationFrame(check);
    setTimeout(check, 600);
  }

  function animateCounter(el) {
    if (!el) return;
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('pt-BR');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function setupCarousel(slideEl) {
    const stack = slideEl.querySelector('.carousel-stack');
    const cards = [...slideEl.querySelectorAll('.carousel-card')];
    const caption = slideEl.querySelector('.carousel-caption');
    const counter = slideEl.querySelector('.carousel-counter');
    const tapHint = slideEl.querySelector('.carousel-tap-hint');
    if (!stack || !cards.length) return;

    const total = cards.length;
    const state = stack._carouselState || {};
    state.index = 0;
    state.animating = false;
    state.viewed = new Set([0]);
    state.allViewed = false;
    stack._carouselState = state;

    if (tapHint) {
      tapHint.textContent = total > 1 ? 'Toque na foto para ver a próxima' : '';
      tapHint.classList.remove('complete');
    }

    function checkAllViewed() {
      if (state.allViewed || state.viewed.size < total) return;
      state.allViewed = true;
      onCarouselComplete(slideEl);
    }

    function updateStack() {
      const prevIdx = (state.index - 1 + total) % total;
      const nextIdx = (state.index + 1) % total;

      cards.forEach((card, i) => {
        card.classList.remove('active', 'prev', 'next', 'hidden', 'exit');
        if (i === state.index) card.classList.add('active');
        else if (total > 1 && i === prevIdx) card.classList.add('prev');
        else if (total > 1 && i === nextIdx) card.classList.add('next');
        else card.classList.add('hidden');
      });

      caption.textContent = cards[state.index].dataset.caption;
      counter.textContent = `${state.index + 1} / ${total}`;
    }

    function nextPhoto() {
      if (state.animating) return;

      if (total < 2) {
        checkAllViewed();
        return;
      }

      state.animating = true;
      const currentCard = cards[state.index];
      currentCard.classList.add('exit');

      setTimeout(() => {
        currentCard.classList.remove('exit');
        state.index = (state.index + 1) % total;
        state.viewed.add(state.index);
        updateStack();
        state.animating = false;
        checkAllViewed();
      }, 400);
    }

    updateStack();

    if (total === 1) {
      checkAllViewed();
    }

    // Evita que o toque que trouxe até este slide dispare o carrossel
    stack.dataset.blockClick = '1';
    setTimeout(() => {
      stack.dataset.blockClick = '';
    }, 500);

    if (!stack.dataset.ready) {
      stack.dataset.ready = '1';
      stack.addEventListener('click', (e) => {
        e.stopPropagation();
        if (stack.dataset.blockClick === '1') return;
        nextPhoto();
      });
    }
  }

  function getRouletteSize() {
    const container = document.querySelector('.roulette-container');
    if (!container) return 260;
    return Math.min(container.clientWidth, 260);
  }

  function drawRoulette() {
    const canvas = document.getElementById('roulette-canvas');
    if (!canvas) return;

    const slide = CONFIG.retrospectiva.slides.find(s => s.tipo === 'roleta');
    if (!slide) return;

    const size = getRouletteSize();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const locais = slide.locais;
    const sliceAngle = (2 * Math.PI) / locais.length;
    const cx = size / 2, cy = size / 2, r = size / 2 - 10;

    ctx.clearRect(0, 0, size, size);

    locais.forEach((local, i) => {
      const start = i * sliceAngle - Math.PI / 2;
      const end = start + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = ROULETTE_COLORS[i % ROULETTE_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      const fontSize = size < 220 ? 9 : 11;
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      const maxLen = size < 220 ? 10 : 14;
      const text = local.length > maxLen ? local.substring(0, maxLen - 1) + '…' : local;
      ctx.fillText(text, r - 8, 4);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.07, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  function getRouletteWinner(rotationDeg, total) {
    const sliceDeg = 360 / total;
    const normalized = ((rotationDeg % 360) + 360) % 360;
    const offsetFromTop = (360 - normalized) % 360;
    return Math.floor(offsetFromTop / sliceDeg) % total;
  }

  function getRotationForWinner(winner, total) {
    const sliceDeg = 360 / total;
    return (360 - (winner + 0.5) * sliceDeg + 360) % 360;
  }

  function calcSpinRotation(currentRotation, winner, total) {
    const targetMod = getRotationForWinner(winner, total);
    const currentMod = ((currentRotation % 360) + 360) % 360;
    let delta = targetMod - currentMod;
    if (delta <= 0) delta += 360;
    const extraSpins = Math.floor(5 + Math.random() * 3) * 360;
    return currentRotation + extraSpins + delta;
  }

  function setupRoulette(slideEl) {
    const canvas = slideEl.querySelector('#roulette-canvas');
    const spinBtn = slideEl.querySelector('#spin-btn');
    const resultEl = slideEl.querySelector('#roulette-result');
    if (!canvas || !spinBtn) return;

    const slide = CONFIG.retrospectiva.slides.find(s => s.tipo === 'roleta');
    const locais = slide.locais;
    const total = locais.length;
    let currentRotation = parseFloat(canvas.dataset.rotation || '0');
    let spinning = false;

    canvas.style.transform = `rotate(${currentRotation}deg)`;

    spinBtn.replaceWith(spinBtn.cloneNode(true));
    const newSpinBtn = slideEl.querySelector('#spin-btn');

    newSpinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (spinning) return;
      spinning = true;
      newSpinBtn.disabled = true;
      resultEl.textContent = '';

      const winner = Math.floor(Math.random() * total);
      currentRotation = calcSpinRotation(currentRotation, winner, total);
      canvas.dataset.rotation = String(currentRotation);
      canvas.style.transform = `rotate(${currentRotation}deg)`;

      setTimeout(() => {
        const actualWinner = getRouletteWinner(currentRotation, total);
        resultEl.textContent = locais[actualWinner];
        spinning = false;
        newSpinBtn.disabled = false;
        enableRouletteAdvance(slideEl);
      }, 4000);
    });
  }

  function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.line').forEach(line => {
            line.style.animationPlayState = 'running';
          });
        }
      });
    }, { threshold: 0.3 });

    const lyrics = document.querySelector('.lyrics-section');
    if (lyrics) observer.observe(lyrics);
  }

  function placeholderImage(text) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <rect fill="#282828" width="400" height="400"/>
      <text fill="#1db954" font-family="Inter,sans-serif" font-size="24" font-weight="700"
        x="50%" y="50%" text-anchor="middle" dy=".3em">${text}</text>
    </svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  window.placeholderImage = placeholderImage;

  window.addEventListener('resize', () => {
    if (!retroSection.classList.contains('hidden')) drawRoulette();
  });

  document.addEventListener('DOMContentLoaded', init);
})();

