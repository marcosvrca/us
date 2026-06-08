(function () {
  const BG_COLORS = ['bg-green', 'bg-purple', 'bg-pink', 'bg-orange', 'bg-blue', 'bg-dark'];
  const ROULETTE_COLORS = ['#1db954', '#8b5cf6', '#ec4899', '#f97316', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#06b6d4', '#a855f7', '#f43f5e', '#14b8a6'];

  let currentSlide = 0;
  let isPlaying = false;
  let autoAdvanceTimer = null;

  const audio = document.getElementById('audio-player');
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
    setupPlayer();
    setupAbout();
    buildRetroSlides();
    setupRetroNavigation();
    setupScrollAnimations();
    preventZoom();
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
    audio.addEventListener('loadedmetadata', () => {
      totalTimeEl.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('ended', () => {
      isPlaying = false;
      updatePlayButton();
      albumArt.classList.remove('playing');
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
      audio.currentTime = 0;
    });
    document.getElementById('next-btn').addEventListener('click', () => {
      audio.currentTime = Math.min(audio.currentTime + 10, audio.duration || 0);
    });
  }

  function togglePlay() {
    if (!audio.src) {
      isPlaying = !isPlaying;
      updatePlayButton();
      albumArt.classList.toggle('playing', isPlaying);
      simulateProgress();
      return;
    }

    if (isPlaying) {
      audio.pause();
      albumArt.classList.remove('playing');
    } else {
      audio.play().catch(() => {
        isPlaying = !isPlaying;
        updatePlayButton();
        albumArt.classList.toggle('playing', isPlaying);
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
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = pct + '%';
    progressThumb.style.left = pct + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);
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
    if (audio.duration) {
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

    document.getElementById('start-retro-btn').addEventListener('click', openRetrospective);
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
      el.className = 'retro-slide ' + BG_COLORS[i % BG_COLORS.length] + (scrollable ? ' scrollable' : '');
      el.dataset.index = i;
      el.innerHTML = renderSlide(slide);
      retroSlides.appendChild(el);
    });
  }

  function renderSlide(slide) {
    switch (slide.tipo) {
      case 'intro':
        return `
          <div class="slide-emoji">${slide.emoji}</div>
          <h2 class="slide-title">${slide.titulo}</h2>
          <p class="slide-subtitle">${slide.subtitulo}</p>`;

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
          <p class="slide-text">${slide.texto}</p>`;

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

      case 'timeline':
        return `
          <h2 class="slide-title">${slide.titulo}</h2>
          <p class="slide-subtitle">${slide.subtitulo}</p>
          <div class="timeline-container">
            ${slide.eventos.map((ev, i) => `
              <div class="timeline-item" style="animation-delay:${i * 0.2}s">
                <span class="timeline-date">${ev.data}</span>
                <div class="timeline-content">
                  <h4>${ev.titulo}</h4>
                  <p>${ev.descricao}</p>
                </div>
              </div>
            `).join('')}
          </div>`;

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
    const pointer = { startX: 0, startY: 0, moved: false, active: false };

    document.getElementById('retro-close').addEventListener('click', closeRetrospective);

    retroSection.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.retro-close, .spin-btn, .carousel-container')) return;
      pointer.startX = e.clientX;
      pointer.startY = e.clientY;
      pointer.moved = false;
      pointer.active = true;
    });

    retroSection.addEventListener('pointermove', (e) => {
      if (!pointer.active) return;
      if (Math.abs(e.clientX - pointer.startX) > 10 || Math.abs(e.clientY - pointer.startY) > 10) {
        pointer.moved = true;
      }
    });

    retroSection.addEventListener('pointerup', (e) => {
      if (!pointer.active) return;
      pointer.active = false;
      if (e.target.closest('.retro-close, .spin-btn, .carousel-container')) return;

      const swipeOnly = tapOverlay.classList.contains('disabled');
      handleRetroNavigation(e.clientX, pointer.startX, pointer.startY, e.clientY, pointer.moved, swipeOnly);
    });

    retroSection.addEventListener('pointercancel', () => {
      pointer.active = false;
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

    if (moved || swipeOnly) return;

    const overlay = document.getElementById('retro-tap-overlay');
    const rect = overlay.getBoundingClientRect();
    const tapPct = (clientX - rect.left) / rect.width;

    if (tapPct < 0.3) {
      if (currentSlide > 0) goToSlide(currentSlide - 1);
    } else {
      if (currentSlide < total - 1) goToSlide(currentSlide + 1);
    }
  }

  function openRetrospective() {
    retroSection.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    currentSlide = 0;
    goToSlide(0);
    drawRoulette();
  }

  function closeRetrospective() {
    retroSection.classList.add('hidden');
    document.body.style.overflow = '';
    clearTimeout(autoAdvanceTimer);
  }

  function goToSlide(index) {
    const total = CONFIG.retrospectiva.slides.length;
    if (index < 0 || index >= total) return;

    const slides = retroSlides.querySelectorAll('.retro-slide');
    const direction = index > currentSlide ? 'exit-left' : 'exit-right';

    slides.forEach((s, i) => {
      s.classList.remove('active', 'exit-left', 'exit-right');
      if (i === currentSlide && i !== index) s.classList.add(direction);
      if (i === index) s.classList.add('active');
    });

    const activeSlide = slides[index];
    const slideData = CONFIG.retrospectiva.slides[index];

    updateProgressBars(index, slideData.tipo !== 'carrossel');
    currentSlide = index;
    const isInteractive = ['carrossel', 'roleta', 'timeline'].includes(slideData.tipo);

    const tapOverlay = document.getElementById('retro-tap-overlay');
    tapOverlay.classList.toggle('disabled', isInteractive);

    const hint = document.querySelector('.retro-tap-hint');
    if (index === total - 1) {
      hint.style.display = 'none';
    } else {
      hint.style.display = 'block';
      if (slideData.tipo === 'carrossel') hint.textContent = 'Toque nas fotos para ver todas';
      else if (isInteractive) hint.textContent = 'Deslize para o lado ↔';
      else hint.textContent = 'Toque para avançar';
    }
    vibrate(12);

    if (slideData.tipo === 'contador' || slideData.tipo === 'contador-dias') {
      animateCounter(activeSlide.querySelector('.counter-display'));
    }

    if (slideData.tipo === 'carrossel') {
      setupCarousel(activeSlide);
    }

    if (slideData.tipo === 'roleta') {
      drawRoulette();
      setupRoulette(activeSlide);
    }

    clearTimeout(autoAdvanceTimer);
    if (slideData.tipo === 'carrossel') return;
    if (slideData.tipo !== 'roleta' && index < total - 1) {
      scheduleSlideAutoAdvance(8000);
    }
  }

  function scheduleSlideAutoAdvance(delay) {
    clearTimeout(autoAdvanceTimer);
    animateProgressBar(currentSlide, delay);
    autoAdvanceTimer = setTimeout(() => {
      if (currentSlide < CONFIG.retrospectiva.slides.length - 1) {
        goToSlide(currentSlide + 1);
      }
    }, delay);
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
          fill.style.transition = 'width 8s linear';
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
    if (retroHint) retroHint.textContent = 'Avançando em instantes...';
    scheduleSlideAutoAdvance(4000);
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

    if (!stack.dataset.ready) {
      stack.dataset.ready = '1';
      stack.addEventListener('click', (e) => {
        e.stopPropagation();
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

