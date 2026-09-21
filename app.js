/* ============================================
   REGALO FLORES AMARILLAS — Para Yaressi 💛
   ============================================ */

/* ---- 1. CANVAS DE PARTÍCULAS DORADAS ---- */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#FFD700','#FFC200','#FFDB58','#FFF3B0','#FF8C00'];

  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x      = Math.random() * W;
      this.y      = initial ? Math.random() * H : H + 10;
      this.r      = Math.random() * 2 + 0.4;
      this.vy     = -(Math.random() * 0.35 + 0.1);
      this.vx     = (Math.random() - 0.5) * 0.25;
      this.alpha  = Math.random() * 0.45 + 0.1;
      this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    update() {
      this.y += this.vy;
      this.x += this.vx;
      if (this.y < -10) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  const particles = Array.from({ length: 140 }, () => new Particle());

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();
})();


/* ---- 2. SOBRE: ABRIR REGALO ---- */
(function initEnvelope() {
  const introScreen = document.getElementById('intro-screen');
  const mainContent = document.getElementById('main-content');
  const envelopeWrap = document.querySelector('.envelope-wrap');

  envelopeWrap.addEventListener('click',      openGift);
  envelopeWrap.addEventListener('touchstart', openGift, { passive: true });
  envelopeWrap.addEventListener('keydown', e => { if (e.key === 'Enter') openGift(); });
  envelopeWrap.setAttribute('tabindex', '0');

  function openGift() {
    // Animar la apertura
    envelopeWrap.style.transform = 'scale(1.1)';
    envelopeWrap.style.transition = 'transform 0.3s';

    setTimeout(() => {
      introScreen.classList.add('hide');

      // Mostrar contenido principal
      mainContent.classList.remove('hidden');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mainContent.classList.add('visible');
        });
      });

      // Lanzar corazones celebratorios
      launchHeartBurst();

      // Iniciar flores y resto de animaciones
      buildFlowersRow();
      buildBouquet();
      initFallingPetals();
      initHeartFloat();
      initCursorTrail();
      initBouquetClick();
      initLilyHoverSound();
    }, 350);
  }
})();


/* ---- 3. FILA DE LIRIOS (header) ---- */
function buildFlowersRow() {
  const row = document.getElementById('flowers-row');

  const flowers = [
    { h: 160, color1: '#FFD700', color2: '#FFC200', stemColor: '#3e7a52', delay: 0 },
    { h: 200, color1: '#FFE44D', color2: '#FFD700', stemColor: '#4a8c60', delay: 150 },
    { h: 230, color1: '#FFC200', color2: '#FF8C00', stemColor: '#3e7a52', delay: 300 },
    { h: 200, color1: '#FFDB58', color2: '#FFD700', stemColor: '#4a8c60', delay: 150 },
    { h: 160, color1: '#FFD700', color2: '#FFA500', stemColor: '#3e7a52', delay: 0 },
  ];

  flowers.forEach((f, i) => {
    const wrap = document.createElement('div');
    wrap.style.cssText = `
      opacity: 0;
      transform: translateY(30px) scale(0.8);
      transition: opacity 0.6s ${f.delay + 400}ms, transform 0.6s ${f.delay + 400}ms cubic-bezier(0.34,1.56,0.64,1);
    `;

    const svg = createLilySVG(f.h, f.color1, f.color2, f.stemColor);
    svg.classList.add('lily-svg');
    svg.style.height = f.h + 'px';
    svg.style.width  = (f.h * 0.55) + 'px';

    wrap.appendChild(svg);
    row.appendChild(wrap);

    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        wrap.style.opacity   = '1';
        wrap.style.transform = 'translateY(0) scale(1)';
      });
    });
  });
}

function createLilySVG(size, c1, c2, stemColor) {
  const vbH = 400;
  const cx = 100, cy = 160;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 200 ${vbH}`);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  svg.innerHTML = `
    <!-- Tallo -->
    <path d="M${cx} ${vbH - 10} Q${cx - 8} 280 ${cx} ${cy + 20}"
          stroke="${stemColor}" stroke-width="6" fill="none" stroke-linecap="round"
          class="lily-stem"/>
    <!-- Hoja izq -->
    <path d="M${cx - 2} 280 Q${cx - 55} 252 ${cx - 72} 220 Q${cx - 30} 244 ${cx - 3} 274"
          fill="${stemColor}"/>
    <!-- Hoja der -->
    <path d="M${cx + 2} 255 Q${cx + 55} 228 ${cx + 70} 196 Q${cx + 32} 218 ${cx + 3} 250"
          fill="${stemColor}"/>
    <!-- Pétalos -->
    <path d="M${cx} ${cy} Q${cx - 28} ${cy - 30} ${cx - 48} ${cy - 70} Q${cx - 18} ${cy - 34} ${cx} ${cy - 18}" fill="${c1}" class="petal"/>
    <path d="M${cx} ${cy} Q${cx + 28} ${cy - 30} ${cx + 48} ${cy - 70} Q${cx + 18} ${cy - 34} ${cx} ${cy - 18}" fill="${c2}" class="petal"/>
    <path d="M${cx} ${cy} Q${cx - 38} ${cy - 12} ${cx - 68} ${cy - 18} Q${cx - 35} ${cy - 10} ${cx - 4} ${cy - 2}" fill="${c1}" class="petal"/>
    <path d="M${cx} ${cy} Q${cx + 38} ${cy - 12} ${cx + 68} ${cy - 18} Q${cx + 35} ${cy - 10} ${cx + 4} ${cy - 2}" fill="${c2}" class="petal"/>
    <path d="M${cx} ${cy} Q${cx - 22} ${cy + 18} ${cx - 32} ${cy + 45} Q${cx - 10} ${cy + 22} ${cx - 2} ${cy + 5}" fill="${c1}" class="petal"/>
    <path d="M${cx} ${cy} Q${cx + 22} ${cy + 18} ${cx + 32} ${cy + 45} Q${cx + 10} ${cy + 22} ${cx + 2} ${cy + 5}" fill="${c2}" class="petal"/>
    <!-- Centro -->
    <circle cx="${cx}" cy="${cy - 5}" r="16" fill="#FF8C00"/>
    <circle cx="${cx}" cy="${cy - 5}" r="9"  fill="#FF6600"/>
    <!-- Estambres -->
    <line x1="${cx}" y1="${cy - 14}" x2="${cx - 8}"  y2="${cy - 28}" stroke="#FF4500" stroke-width="1.5"/>
    <circle cx="${cx - 8}"  cy="${cy - 29}" r="2.5" fill="${c1}"/>
    <line x1="${cx}" y1="${cy - 14}" x2="${cx + 8}"  y2="${cy - 28}" stroke="#FF4500" stroke-width="1.5"/>
    <circle cx="${cx + 8}"  cy="${cy - 29}" r="2.5" fill="${c1}"/>
    <line x1="${cx}" y1="${cy - 14}" x2="${cx}"      y2="${cy - 30}" stroke="#FF4500" stroke-width="1.5"/>
    <circle cx="${cx}"      cy="${cy - 31}" r="2.5" fill="${c1}"/>
  `;
  return svg;
}


/* ---- 4. RAMO GRANDE SVG ---- */
function buildBouquet() {
  const bouquet = document.getElementById('bouquet');

  // Tamaño del ramo adaptado al ancho de pantalla
  const isMobile = window.innerWidth <= 480;
  const svgW = isMobile ? Math.min(window.innerWidth * 0.88, 300) : 320;
  const svgH = isMobile ? svgW * 1.25 : 400;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 400 500');
  svg.setAttribute('width',  svgW.toString());
  svg.setAttribute('height', svgH.toString());

  svg.innerHTML = `
    <!-- Lazo -->
    <path d="M160 420 Q140 400 120 390 Q150 395 180 405 Q200 410 180 420Z" fill="#FFD700" opacity="0.9"/>
    <path d="M240 420 Q260 400 280 390 Q250 395 220 405 Q200 410 220 420Z" fill="#FFC200" opacity="0.9"/>
    <ellipse cx="200" cy="422" rx="22" ry="14" fill="#FF8C00"/>

    <!-- Tallos -->
    <path d="M200 420 Q188 370 175 310" stroke="#3e7a52" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M200 420 Q200 368 200 305" stroke="#4a8c60" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M200 420 Q212 370 225 310" stroke="#3e7a52" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M200 420 Q178 362 155 295" stroke="#4a8c60" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M200 420 Q222 362 245 295" stroke="#3e7a52" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M200 420 Q165 355 140 280" stroke="#4a8c60" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M200 420 Q235 355 260 280" stroke="#3e7a52" stroke-width="3.5" fill="none" stroke-linecap="round"/>

    <!-- Hojas -->
    <path d="M185 350 Q155 330 145 308 Q170 325 183 344" fill="#5a9e6f"/>
    <path d="M215 340 Q245 320 255 298 Q230 315 217 334" fill="#5a9e6f"/>
    <path d="M165 320 Q138 295 132 268 Q158 290 163 314" fill="#4a8c60"/>
    <path d="M235 315 Q262 290 268 263 Q242 285 237 309" fill="#4a8c60"/>

    <!-- Flor centro (grande) -->
    <g transform="translate(200, 210)">
      <path d="M0 0 Q-28 -38 -44 -78 Q-14 -38 0 -22" fill="#FFD700"/>
      <path d="M0 0 Q28 -38 44 -78 Q14 -38 0 -22" fill="#FFC200"/>
      <path d="M0 0 Q-42 -14 -78 -20 Q-40 -12 -4 -2" fill="#FFD700"/>
      <path d="M0 0 Q42 -14 78 -20 Q40 -12 4 -2" fill="#FFC200"/>
      <path d="M0 0 Q-26 20 -36 50 Q-12 22 -2 5" fill="#FFDB58"/>
      <path d="M0 0 Q26 20 36 50 Q12 22 2 5" fill="#FFD700"/>
      <circle cx="0" cy="-8" r="20" fill="#FF8C00"/>
      <circle cx="0" cy="-8" r="11" fill="#FF6600"/>
      <line x1="0" y1="-19" x2="-10" y2="-36" stroke="#FF4500" stroke-width="2"/>
      <circle cx="-10" cy="-37" r="3.5" fill="#FFD700"/>
      <line x1="0" y1="-19" x2="10" y2="-36" stroke="#FF4500" stroke-width="2"/>
      <circle cx="10" cy="-37" r="3.5" fill="#FFD700"/>
      <line x1="0" y1="-19" x2="0" y2="-38" stroke="#FF4500" stroke-width="2"/>
      <circle cx="0" cy="-39" r="3.5" fill="#FFD700"/>
    </g>

    <!-- Flor izquierda -->
    <g transform="translate(140, 248) scale(0.82)">
      <path d="M0 0 Q-24 -34 -38 -68 Q-12 -32 0 -18" fill="#FFE44D"/>
      <path d="M0 0 Q24 -34 38 -68 Q12 -32 0 -18" fill="#FFCC00"/>
      <path d="M0 0 Q-36 -12 -68 -18 Q-35 -10 -3 -2" fill="#FFE44D"/>
      <path d="M0 0 Q36 -12 68 -18 Q35 -10 3 -2" fill="#FFCC00"/>
      <path d="M0 0 Q-22 18 -30 44 Q-10 19 -2 4" fill="#FFD426"/>
      <path d="M0 0 Q22 18 30 44 Q10 19 2 4" fill="#FFE44D"/>
      <circle cx="0" cy="-7" r="17" fill="#FF9500"/>
      <circle cx="0" cy="-7" r="9" fill="#FF7000"/>
    </g>

    <!-- Flor derecha -->
    <g transform="translate(260, 248) scale(0.82)">
      <path d="M0 0 Q-24 -34 -38 -68 Q-12 -32 0 -18" fill="#FFD700"/>
      <path d="M0 0 Q24 -34 38 -68 Q12 -32 0 -18" fill="#FFA500"/>
      <path d="M0 0 Q-36 -12 -68 -18 Q-35 -10 -3 -2" fill="#FFD700"/>
      <path d="M0 0 Q36 -12 68 -18 Q35 -10 3 -2" fill="#FFA500"/>
      <path d="M0 0 Q-22 18 -30 44 Q-10 19 -2 4" fill="#FFB700"/>
      <path d="M0 0 Q22 18 30 44 Q10 19 2 4" fill="#FFD700"/>
      <circle cx="0" cy="-7" r="17" fill="#FF6600"/>
      <circle cx="0" cy="-7" r="9" fill="#FF4400"/>
    </g>

    <!-- Flores pequeñas laterales -->
    <g transform="translate(110, 275) scale(0.65)">
      <path d="M0 0 Q-20 -28 -32 -58 Q-10 -27 0 -15" fill="#FFF3B0"/>
      <path d="M0 0 Q20 -28 32 -58 Q10 -27 0 -15" fill="#FFDB58"/>
      <path d="M0 0 Q-30 -10 -56 -14 Q-28 -8 -2 -1" fill="#FFF3B0"/>
      <path d="M0 0 Q30 -10 56 -14 Q28 -8 2 -1" fill="#FFDB58"/>
      <circle cx="0" cy="-6" r="13" fill="#FF9500"/>
      <circle cx="0" cy="-6" r="7"  fill="#FF7000"/>
    </g>
    <g transform="translate(290, 275) scale(0.65)">
      <path d="M0 0 Q-20 -28 -32 -58 Q-10 -27 0 -15" fill="#FFDB58"/>
      <path d="M0 0 Q20 -28 32 -58 Q10 -27 0 -15" fill="#FFC200"/>
      <path d="M0 0 Q-30 -10 -56 -14 Q-28 -8 -2 -1" fill="#FFDB58"/>
      <path d="M0 0 Q30 -10 56 -14 Q28 -8 2 -1" fill="#FFC200"/>
      <circle cx="0" cy="-6" r="13" fill="#FF8C00"/>
      <circle cx="0" cy="-6" r="7"  fill="#FF6600"/>
    </g>

    <!-- Nombre Yaressi -->
    <text x="200" y="475" text-anchor="middle"
          font-family="'Dancing Script', cursive"
          font-size="26" fill="#FFD700" opacity="0.9">Para Yaressi 💛</text>
  `;

  bouquet.appendChild(svg);
}


/* ---- 5. CLICK / TOUCH EN RAMO: EXPLOSIÓN DE CORAZONES ---- */
function initBouquetClick() {
  const bouquet = document.getElementById('bouquet');

  function burst(e) {
    const rect = bouquet.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    heartBurstAt(cx, cy, 16);
  }

  bouquet.addEventListener('click',      burst);
  bouquet.addEventListener('touchstart', burst, { passive: true });
}


/* ---- 6. PÉTALOS CAYENDO ---- */
function initFallingPetals() {
  const container = document.getElementById('petals-container');
  const COLORS_PAIRS = [
    ['#FFD700','#FFA500'], ['#FFC200','#FF8C00'],
    ['#FFDB58','#FFD700'], ['#FFF3B0','#FFDB58'], ['#FFE44D','#FFC200'],
  ];

  for (let i = 0; i < 20; i++) {
    const petal = document.createElement('div');
    petal.classList.add('falling-petal');
    const [c1, c2] = COLORS_PAIRS[i % COLORS_PAIRS.length];
    const size = Math.random() * 20 + 14;
    const left = Math.random() * 100;
    const dur  = Math.random() * 10 + 12;
    const del  = Math.random() * 18;
    const skew = (Math.random() - 0.5) * 40;

    petal.style.cssText = `
      left: ${left}%; width: ${size}px; height: ${size * 1.5}px;
      animation-duration: ${dur}s; animation-delay: -${del}s;
      transform: rotate(${skew}deg);
    `;
    petal.innerHTML = `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <path d="M20 55 Q8 40 10 20 Q20 5 30 20 Q32 40 20 55Z" fill="${c1}" opacity="0.85"/>
      <path d="M20 55 Q14 42 16 25 Q20 12 20 55Z" fill="${c2}" opacity="0.4"/>
    </svg>`;
    container.appendChild(petal);
  }
}


/* ---- 7. CORAZONES FLOTANDO PERIÓDICAMENTE ---- */
function initHeartFloat() {
  const container = document.getElementById('hearts-container');
  const hearts = ['💛','💛','🌼','💛','💛','✨','💛'];

  function spawnHeart() {
    const el  = document.createElement('div');
    el.classList.add('floating-heart');
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    const dur  = Math.random() * 4 + 5;
    const left = Math.random() * 90 + 5;
    const size = Math.random() * 1.2 + 0.8;
    el.style.cssText = `
      left: ${left}%; font-size: ${size * 1.5}rem;
      animation-duration: ${dur}s;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), dur * 1000);
  }

  // Primer lote
  for (let i = 0; i < 5; i++) {
    setTimeout(spawnHeart, i * 400);
  }
  // Continuo
  setInterval(spawnHeart, 1800);
}


/* ---- 8. EXPLOSIÓN DE CORAZONES AL ABRIR ---- */
function launchHeartBurst() {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  heartBurstAt(cx, cy, 24);
}

function heartBurstAt(cx, cy, count) {
  const emojis = ['💛','💛','🌼','✨','💛','💛'];
  for (let i = 0; i < count; i++) {
    const el    = document.createElement('div');
    const angle = (i / count) * 360;
    const dist  = Math.random() * 160 + 60;
    const rad   = (angle * Math.PI) / 180;
    const tx    = Math.cos(rad) * dist;
    const ty    = Math.sin(rad) * dist;
    const size  = Math.random() * 1.4 + 0.8;

    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.cssText = `
      position: fixed;
      left: ${cx}px; top: ${cy}px;
      font-size: ${size * 1.8}rem;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%,-50%);
      transition: transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.9s ease;
    `;
    document.body.appendChild(el);
    el.getBoundingClientRect(); // reflow
    el.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`;
    el.style.opacity   = '0';
    setTimeout(() => el.remove(), 950);
  }
}


/* ---- 9. ESTELA DEL CURSOR (solo en escritorio) ---- */
function initCursorTrail() {
  // En dispositivos touch no hay cursor, se omite
  if (window.matchMedia('(hover: none)').matches) return;
  const N = 10;
  const dots = Array.from({ length: N }, (_, i) => {
    const d = document.createElement('div');
    d.style.cssText = `
      position: fixed; border-radius: 50%; pointer-events: none; z-index: 9998;
      transform: translate(-50%,-50%); background: radial-gradient(circle,#FFD700,#FF8C00);
      opacity: 0; transition: opacity 0.3s;
    `;
    document.body.appendChild(d);
    return { el: d, x: 0, y: 0 };
  });

  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function trail() {
    let x = mx, y = my;
    dots.forEach((dot, i) => {
      const sz = (N - i) * 2.2 + 1;
      dot.el.style.width   = sz + 'px';
      dot.el.style.height  = sz + 'px';
      dot.el.style.left    = x + 'px';
      dot.el.style.top     = y + 'px';
      dot.el.style.opacity = ((1 - i / N) * 0.75).toString();
      const px = dot.x, py = dot.y;
      dot.x = x; dot.y = y;
      x = x - (x - px) * 0.35;
      y = y - (y - py) * 0.35;
    });
    requestAnimationFrame(trail);
  })();
}


/* ---- 10. HOVER SUAVE EN LIRIOS DEL HEADER ---- */
function initLilyHoverSound() {
  // Efecto visual extra en hover de lirios del header
  document.querySelectorAll('.lily-svg').forEach(lily => {
    function burstLily(e) {
      const rect = lily.getBoundingClientRect();
      heartBurstAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
    }
    lily.addEventListener('click',      burstLily);
    lily.addEventListener('touchstart', burstLily, { passive: true });
  });
}
