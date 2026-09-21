/* ============================================
   FLORÍCRAFT — JavaScript original corregido
   (operadores * reparados, console.log eliminados)
   ============================================ */

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// ---- Constantes ----
const TILE_SIZE            = 32;
const WORLD_WIDTH_TILES    = 40;
const WORLD_HEIGHT_TILES   = 20;
const PLAYER_SIZE          = TILE_SIZE * 0.9;
const GRAVITY              = 0.5;
const JUMP_STRENGTH        = -10;
const PLAYER_SPEED         = 5;
const INTERACTION_RANGE_TILES = 2;

canvas.width  = WORLD_WIDTH_TILES  * TILE_SIZE;
canvas.height = WORLD_HEIGHT_TILES * TILE_SIZE;

// ---- Estado del jugador ----
const player = {
  x: canvas.width / 2 - PLAYER_SIZE / 2,
  y: TILE_SIZE * 2,
  vx: 0,
  vy: 0,
  onGround: false,
};

// ---- Tipos de bloque ----
const BLOCK_TYPES = {
  0:  { name: 'air',          color: 'rgba(0,0,0,0)', breakable: false, placeable: false },
  1:  { name: 'grass',        color: '#7CFC00',  breakable: true, placeable: true, texture: '🌿' },
  2:  { name: 'dirt',         color: '#8B4513',  breakable: true, placeable: true, texture: '🟫' },
  3:  { name: 'stone',        color: '#808080',  breakable: true, placeable: true, texture: '🪨' },
  4:  { name: 'wood',         color: '#A0522D',  breakable: true, placeable: true, texture: '🪵' },
  5:  { name: 'sand',         color: '#F4A460',  breakable: true, placeable: true, texture: '🟨' },
  6:  { name: 'savanna_grass',color: '#B3CC57',  breakable: true, placeable: true, texture: '🌾' },
  7:  { name: 'savanna_dirt', color: '#C2B280',  breakable: true, placeable: true, texture: '🟫' },
  8:  { name: 'acacia_wood',  color: '#964B00',  breakable: true, placeable: true, texture: '🌳' },
  9:  { name: 'dark_oak',     color: '#4B3621',  breakable: true, placeable: true, texture: '🌲' },
  10: { name: 'spruce_wood',  color: '#5C4033',  breakable: true, placeable: true, texture: '🪵' },
  11: { name: 'pine_leaves',  color: '#228B22',  breakable: true, placeable: true, texture: '🎄' },
  12: { name: 'cactus',       color: '#006400',  breakable: true, placeable: true, texture: '🌵' },
  13: { name: 'red_sand',     color: '#C19A6B',  breakable: true, placeable: true, texture: '🟧' },
  14: { name: 'coal_ore',     color: '#36454F',  breakable: true, placeable: true, texture: '⚫' },
  15: { name: 'iron_ore',     color: '#A9A9A9',  breakable: true, placeable: true, texture: '⚪' },
  16: { name: 'gold_ore',     color: '#DAA520',  breakable: true, placeable: true, texture: '🟡' },
  17: { name: 'diamond_ore',  color: '#B9F2FF',  breakable: true, placeable: true, texture: '💎' },
  18: { name: 'mossy_stone',  color: '#737C6D',  breakable: true, placeable: true, texture: '🪨' },
  19: { name: 'gravel',       color: '#787878',  breakable: true, placeable: true, texture: '🪨' },
  20: { name: 'clay',         color: '#A0A0A0',  breakable: true, placeable: true, texture: '🟫' },
};

// ---- Inventario ----
const inventory       = [1, 2, 3, 4, 5, 6, 8, 12, 14, 19, 20];
let selectedBlockIndex = 0;
let selectedBlockType  = inventory[selectedBlockIndex];

// ---- Input ----
const keysPressed = {};
let mouse               = { x: 0, y: 0 };
let targetBlockHighlight = null;

// ---- Mundo ----
let world = [];

// ---- Modo creador ----
let creatorMode = false;
const creatorModeToggleBtn = document.getElementById('creatorModeToggle');

// ---- Biomas ----
const BIOME_DEFINITIONS = [
  { type: 'green_fields', groundBlock: 1,  dirtBlock: 2,  treeChance:  0.03,  treeType: 4,  skyColor: '#87CEEB' },
  { type: 'forest',       groundBlock: 1,  dirtBlock: 2,  treeChance:  0.08,  treeType: 'mixed', skyColor: '#7AB7D8' },
  { type: 'desert',       groundBlock: 5,  dirtBlock: 13, cactusChance:0.015, skyColor: '#ADD8E6' },
  { type: 'savanna',      groundBlock: 6,  dirtBlock: 7,  treeChance:  0.02,  treeType: 8,  skyColor: '#9ACD32' },
  { type: 'island',       groundBlock: 1,  dirtBlock: 2,  treeChance:  0.04,  treeType: 4,
    islandHeight: WORLD_HEIGHT_TILES * 0.4, skyColor: '#87CEEB' },
];

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
function initGame() {
  generateWorld();
  setupEventListeners();
  updateInventoryUI();
  gameLoop();
}

/* ══════════════════════════════════════════
   GENERACIÓN DEL MUNDO
══════════════════════════════════════════ */
function generateWorld() {
  world = [];
  for (let y = 0; y < WORLD_HEIGHT_TILES; y++) {
    world[y] = [];
    for (let x = 0; x < WORLD_WIDTH_TILES; x++) {
      world[y][x] = 0;
    }
  }

  // Secuencia de biomas
  const biomeSequence = [];
  let currentX = 0;
  const minBiomeWidth = 8, maxBiomeWidth = 20;

  while (currentX < WORLD_WIDTH_TILES) {
    const def = BIOME_DEFINITIONS[Math.floor(Math.random() * BIOME_DEFINITIONS.length)];
    let w = Math.floor(Math.random() * (maxBiomeWidth - minBiomeWidth + 1)) + minBiomeWidth;
    if (currentX + w > WORLD_WIDTH_TILES) w = WORLD_WIDTH_TILES - currentX;
    if (w > 0) {
      biomeSequence.push({ ...def, startX: currentX, endX: currentX + w });
      currentX += w;
    }
  }

  // Relleno de terreno
  for (const biome of biomeSequence) {
    for (let x = biome.startX; x < biome.endX; x++) {
      if (x >= WORLD_WIDTH_TILES) continue;

      let groundLevel;
      if (biome.type === 'island') {
        groundLevel = biome.islandHeight;
      } else {
        const base = Math.floor(WORLD_HEIGHT_TILES * 0.7);
        let offset =
          Math.floor(Math.sin(x * 0.5) * 2) +
          Math.floor(Math.sin(x * 0.2) * 3) +
          Math.floor(Math.random() * 2) - 1;
        if (biome.type === 'desert') {
          offset = Math.floor(Math.sin(x * 0.8) * 4) + Math.floor(Math.random() * 2);
        }
        groundLevel = base + offset;
      }

      for (let y = 0; y < WORLD_HEIGHT_TILES; y++) {
        world[y] = world[y] || [];
        if (y > groundLevel) {
          world[y][x] = y === groundLevel + 1 ? biome.groundBlock : biome.dirtBlock;
        } else {
          world[y][x] = 0;
        }
      }
    }
  }

  // Capa profunda con minerales
  const deepest = WORLD_HEIGHT_TILES - 3;
  for (let y = deepest; y < WORLD_HEIGHT_TILES; y++) {
    for (let x = 0; x < WORLD_WIDTH_TILES; x++) {
      if (world[y][x] === 0) world[y][x] = 3;
      if (world[y][x] !== 0) {
        const r = Math.random();
        if      (r < 0.005) world[y][x] = 17;
        else if (r < 0.015) world[y][x] = 16;
        else if (r < 0.035) world[y][x] = 15;
        else if (r < 0.075) world[y][x] = 14;
        else if (r < 0.125) world[y][x] = 18;
        else if (r < 0.185) world[y][x] = 19;
        else if (r < 0.255) world[y][x] = 20;
      }
    }
  }

  // Árboles, cactus
  for (let x = 0; x < WORLD_WIDTH_TILES; x++) {
    let biome = null;
    for (const b of biomeSequence) {
      if (x >= b.startX && x < b.endX) { biome = b; break; }
    }
    if (!biome) continue;

    const groundY = (function() {
      for (let y = 0; y < WORLD_HEIGHT_TILES; y++) {
        if (world[y][x] !== 0) return y;
      }
      return WORLD_HEIGHT_TILES - 1;
    })();

    if (groundY >= WORLD_HEIGHT_TILES - 1) continue;

    if ((biome.type === 'green_fields' || biome.type === 'island') && Math.random() < biome.treeChance) {
      generateTree(x, groundY, biome.treeType);
    } else if (biome.type === 'forest' && Math.random() < biome.treeChance) {
      generateTree(x, groundY, Math.random() < 0.5 ? 9 : 10);
    } else if (biome.type === 'savanna' && Math.random() < biome.treeChance) {
      generateTree(x, groundY, biome.treeType);
    } else if (biome.type === 'desert' && Math.random() < biome.cactusChance) {
      generateCactus(x, groundY);
    }
  }
}

function generateTree(startX, startY, woodBlockId) {
  const trunkH = Math.floor(Math.random() * 2) + 3;
  for (let h = 0; h < trunkH; h++) {
    if (startY - h >= 0 && world[startY - h][startX] === 0) {
      world[startY - h][startX] = woodBlockId;
    }
  }
  const leafId  = (woodBlockId === 9 || woodBlockId === 10) ? 11 : woodBlockId === 8 ? 6 : 1;
  const leafTopY = startY - trunkH;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const ly = leafTopY + dy, lx = startX + dx;
      if (ly >= 0 && lx >= 0 && lx < WORLD_WIDTH_TILES && world[ly][lx] === 0) {
        world[ly][lx] = leafId;
      }
    }
  }
  if (leafTopY - 1 >= 0 && world[leafTopY - 1][startX] === 0) {
    world[leafTopY - 1][startX] = leafId;
  }
}

function generateCactus(startX, startY) {
  const h = Math.floor(Math.random() * 2) + 2;
  for (let i = 0; i < h; i++) {
    if (startY - i >= 0 && world[startY - i][startX] === 0) {
      world[startY - i][startX] = 12;
    }
  }
}

/* ══════════════════════════════════════════
   EVENTOS
══════════════════════════════════════════ */
function setupEventListeners() {
  document.addEventListener('keydown', (e) => {
    keysPressed[e.code] = true;

    if (e.code.startsWith('Digit')) {
      const d = parseInt(e.code.replace('Digit', ''));
      if (d >= 1 && d <= inventory.length && d <= 9) {
        selectedBlockIndex = d - 1;
        selectedBlockType  = inventory[selectedBlockIndex];
        updateInventoryUI();
      }
    }
    if (e.code === 'KeyQ') {
      e.preventDefault();
      if (targetBlockHighlight && targetBlockHighlight.type === 'break') {
        breakBlock(targetBlockHighlight.x, targetBlockHighlight.y);
      }
    }
    if (e.code === 'KeyE') {
      e.preventDefault();
      if (targetBlockHighlight && targetBlockHighlight.type === 'place') {
        placeBlock(targetBlockHighlight.x, targetBlockHighlight.y);
      }
    }
  });

  document.addEventListener('keyup', (e) => { keysPressed[e.code] = false; });

  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
    updateTargetBlockHighlight();
  });

  canvas.addEventListener('mouseleave', () => { targetBlockHighlight = null; });

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      e.preventDefault();
      if (targetBlockHighlight && targetBlockHighlight.type === 'place') {
        placeBlock(targetBlockHighlight.x, targetBlockHighlight.y);
      }
    }
  });

  canvas.addEventListener('dblclick', (e) => {
    if (e.button === 0) {
      e.preventDefault();
      if (targetBlockHighlight && targetBlockHighlight.type === 'break') {
        breakBlock(targetBlockHighlight.x, targetBlockHighlight.y);
      }
    }
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    selectedBlockIndex = e.deltaY < 0
      ? (selectedBlockIndex - 1 + inventory.length) % inventory.length
      : (selectedBlockIndex + 1) % inventory.length;
    selectedBlockType = inventory[selectedBlockIndex];
    updateInventoryUI();
    updateTargetBlockHighlight();
  }, { passive: false });

  creatorModeToggleBtn.addEventListener('click', () => {
    creatorMode = !creatorMode;
    creatorModeToggleBtn.textContent = `Modo Creador (${creatorMode ? 'ON' : 'OFF'})`;
    creatorModeToggleBtn.classList.toggle('active', creatorMode);
    updateTargetBlockHighlight();
  });
}

/* ══════════════════════════════════════════
   LÓGICA
══════════════════════════════════════════ */
function updateTargetBlockHighlight() {
  const tileX = Math.floor(mouse.x / TILE_SIZE);
  const tileY = Math.floor(mouse.y / TILE_SIZE);

  if (tileX < 0 || tileX >= WORLD_WIDTH_TILES || tileY < 0 || tileY >= WORLD_HEIGHT_TILES) {
    targetBlockHighlight = null;
    return;
  }

  if (!creatorMode) {
    const pcx = player.x + PLAYER_SIZE / 2;
    const pcy = player.y + PLAYER_SIZE / 2;
    const bcx = tileX * TILE_SIZE + TILE_SIZE / 2;
    const bcy = tileY * TILE_SIZE + TILE_SIZE / 2;
    const dist = Math.sqrt((pcx - bcx) ** 2 + (pcy - bcy) ** 2);
    if (dist > INTERACTION_RANGE_TILES * TILE_SIZE) {
      targetBlockHighlight = null;
      return;
    }
  }

  const blockId   = world[tileY][tileX];
  const blockInfo = BLOCK_TYPES[blockId];

  if (blockInfo && blockInfo.breakable && blockId !== 0) {
    targetBlockHighlight = { x: tileX, y: tileY, type: 'break' };
  } else if (blockId === 0) {
    const playerRect = { x: player.x, y: player.y, width: PLAYER_SIZE, height: PLAYER_SIZE };
    const tileRect   = { x: tileX * TILE_SIZE, y: tileY * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
    if (!checkCollision(playerRect, tileRect) && BLOCK_TYPES[selectedBlockType].placeable) {
      targetBlockHighlight = { x: tileX, y: tileY, type: 'place' };
    } else {
      targetBlockHighlight = null;
    }
  } else {
    targetBlockHighlight = null;
  }
}

function updatePlayer() {
  player.vy += GRAVITY;
  player.vx  = 0;

  if (keysPressed['KeyA']) player.vx = -PLAYER_SPEED;
  if (keysPressed['KeyD']) player.vx =  PLAYER_SPEED;
  if ((keysPressed['Space'] || keysPressed['KeyW']) && player.onGround) {
    player.vy       = JUMP_STRENGTH;
    player.onGround = false;
  }

  let nextX = Math.max(0, Math.min(player.x + player.vx, canvas.width  - PLAYER_SIZE));
  let nextY = Math.max(0, Math.min(player.y + player.vy, canvas.height - PLAYER_SIZE));

  // Colisión horizontal
  const rectX = { x: nextX, y: player.y, width: PLAYER_SIZE, height: PLAYER_SIZE };
  const ty1 = Math.floor(rectX.y / TILE_SIZE);
  const ty2 = Math.floor((rectX.y + rectX.height - 1) / TILE_SIZE);
  for (let ty = ty1; ty <= ty2; ty++) {
    if (player.vx < 0) {
      const tx = Math.max(0, Math.floor(rectX.x / TILE_SIZE));
      const bid = world[ty]?.[tx] ?? 0;
      if (bid !== 0) {
        const br = { x: tx * TILE_SIZE, y: ty * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
        if (checkCollision(rectX, br)) { nextX = br.x + br.width; player.vx = 0; break; }
      }
    } else if (player.vx > 0) {
      const tx = Math.min(WORLD_WIDTH_TILES - 1, Math.floor((rectX.x + rectX.width - 1) / TILE_SIZE));
      const bid = world[ty]?.[tx] ?? 0;
      if (bid !== 0) {
        const br = { x: tx * TILE_SIZE, y: ty * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
        if (checkCollision(rectX, br)) { nextX = br.x - rectX.width; player.vx = 0; break; }
      }
    }
  }
  player.x = nextX;

  // Colisión vertical
  const rectY = { x: player.x, y: nextY, width: PLAYER_SIZE, height: PLAYER_SIZE };
  const tx1 = Math.floor(rectY.x / TILE_SIZE);
  const tx2 = Math.floor((rectY.x + rectY.width - 1) / TILE_SIZE);
  player.onGround = false;
  for (let tx = tx1; tx <= tx2; tx++) {
    if (player.vy > 0) {
      const ty = Math.min(WORLD_HEIGHT_TILES - 1, Math.floor((rectY.y + rectY.height - 1) / TILE_SIZE));
      const bid = world[ty]?.[tx] ?? 0;
      if (bid !== 0) {
        const br = { x: tx * TILE_SIZE, y: ty * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
        if (checkCollision(rectY, br)) { nextY = br.y - rectY.height; player.vy = 0; player.onGround = true; break; }
      }
    } else if (player.vy < 0) {
      const ty = Math.max(0, Math.floor(rectY.y / TILE_SIZE));
      const bid = world[ty]?.[tx] ?? 0;
      if (bid !== 0) {
        const br = { x: tx * TILE_SIZE, y: ty * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
        if (checkCollision(rectY, br)) { nextY = br.y + br.height; player.vy = 0; break; }
      }
    }
  }
  player.y = nextY;
}

function checkCollision(r1, r2) {
  return r1.x < r2.x + r2.width  &&
         r1.x + r1.width  > r2.x &&
         r1.y < r2.y + r2.height &&
         r1.y + r1.height > r2.y;
}

function breakBlock(tileX, tileY) {
  if (tileX < 0 || tileX >= WORLD_WIDTH_TILES || tileY < 0 || tileY >= WORLD_HEIGHT_TILES) return;
  const info = BLOCK_TYPES[world[tileY][tileX]];
  if (info && info.breakable && world[tileY][tileX] !== 0) {
    world[tileY][tileX] = 0;
  }
}

function placeBlock(tileX, tileY) {
  if (tileX < 0 || tileX >= WORLD_WIDTH_TILES || tileY < 0 || tileY >= WORLD_HEIGHT_TILES) return;
  const info = BLOCK_TYPES[selectedBlockType];
  if (!info || !info.placeable) return;
  if (world[tileY][tileX] === 0) {
    const pr = { x: player.x, y: player.y, width: PLAYER_SIZE, height: PLAYER_SIZE };
    const tr = { x: tileX * TILE_SIZE, y: tileY * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
    if (!checkCollision(pr, tr)) world[tileY][tileX] = selectedBlockType;
  }
}

/* ══════════════════════════════════════════
   DIBUJO
══════════════════════════════════════════ */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Bloques
  for (let y = 0; y < WORLD_HEIGHT_TILES; y++) {
    for (let x = 0; x < WORLD_WIDTH_TILES; x++) {
      const id   = world[y][x];
      const info = BLOCK_TYPES[id];
      if (!info || id === 0) continue;

      ctx.fillStyle = info.color;
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

      if (info.texture) {
        ctx.font          = `${TILE_SIZE * 0.7}px Arial`;
        ctx.textAlign     = 'center';
        ctx.textBaseline  = 'middle';
        ctx.fillText(info.texture, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);
      }

      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth   = 1;
      ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  // Jugador (Yaressi — pelo oscuro, vestido amarillo)
  // Cuerpo / vestido
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(player.x, player.y + PLAYER_SIZE * 0.45, PLAYER_SIZE, PLAYER_SIZE * 0.55);
  // Torso
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(player.x + PLAYER_SIZE * 0.1, player.y + PLAYER_SIZE * 0.25, PLAYER_SIZE * 0.8, PLAYER_SIZE * 0.25);
  // Cabeza
  ctx.fillStyle = '#f4c28a';
  ctx.fillRect(player.x + PLAYER_SIZE * 0.1, player.y, PLAYER_SIZE * 0.8, PLAYER_SIZE * 0.3);
  // Cabello
  ctx.fillStyle = '#2d1b00';
  ctx.fillRect(player.x + PLAYER_SIZE * 0.05, player.y, PLAYER_SIZE * 0.9, PLAYER_SIZE * 0.1);
  ctx.fillRect(player.x + PLAYER_SIZE * 0.05, player.y, PLAYER_SIZE * 0.15, PLAYER_SIZE * 0.28);
  ctx.fillRect(player.x + PLAYER_SIZE * 0.8,  player.y, PLAYER_SIZE * 0.15, PLAYER_SIZE * 0.25);
  // Ojos
  ctx.fillStyle = '#1a0a00';
  ctx.fillRect(player.x + PLAYER_SIZE * 0.25, player.y + PLAYER_SIZE * 0.12, PLAYER_SIZE * 0.15, PLAYER_SIZE * 0.1);
  ctx.fillRect(player.x + PLAYER_SIZE * 0.6,  player.y + PLAYER_SIZE * 0.12, PLAYER_SIZE * 0.15, PLAYER_SIZE * 0.1);
  // Sonrisa
  ctx.fillStyle = '#3d1f00';
  ctx.fillRect(player.x + PLAYER_SIZE * 0.3,  player.y + PLAYER_SIZE * 0.24, PLAYER_SIZE * 0.4,  PLAYER_SIZE * 0.04);
  // Lazo amarillo
  ctx.fillStyle = '#FFA500';
  ctx.fillRect(player.x + PLAYER_SIZE * 0.7,  player.y, PLAYER_SIZE * 0.2, PLAYER_SIZE * 0.1);

  // Resaltado de bloque objetivo
  if (targetBlockHighlight) {
    ctx.strokeStyle = targetBlockHighlight.type === 'break' ? '#ff4444' : '#FFD700';
    ctx.lineWidth   = 3;
    ctx.strokeRect(
      targetBlockHighlight.x * TILE_SIZE,
      targetBlockHighlight.y * TILE_SIZE,
      TILE_SIZE, TILE_SIZE
    );
  }
}

/* ══════════════════════════════════════════
   INVENTARIO UI
══════════════════════════════════════════ */
function updateInventoryUI() {
  const panel = document.getElementById('inventoryPanel');
  panel.innerHTML = '';

  inventory.forEach((blockId, index) => {
    const info = BLOCK_TYPES[blockId];
    if (!info) return;

    const slot = document.createElement('div');
    slot.classList.add('inventory-slot');
    if (index === selectedBlockIndex) slot.classList.add('selected');
    slot.dataset.index = index;
    slot.title         = info.name;

    const display = document.createElement('div');
    display.style.cssText = `
      width:100%; height:100%;
      background-color:${info.color};
      display:flex; justify-content:center; align-items:center;
      font-size:${TILE_SIZE * 0.6}px; border-radius:4px;
    `;
    display.textContent = info.texture || '';
    slot.appendChild(display);

    slot.addEventListener('click', () => {
      selectedBlockIndex = index;
      selectedBlockType  = inventory[selectedBlockIndex];
      updateInventoryUI();
      updateTargetBlockHighlight();
    });

    panel.appendChild(slot);
  });
}

/* ══════════════════════════════════════════
   GAME LOOP
══════════════════════════════════════════ */
function gameLoop() {
  updatePlayer();
  draw();
  requestAnimationFrame(gameLoop);
}

/* ══════════════════════════════════════════
   CONTROLES TÁCTILES (celular)
══════════════════════════════════════════ */
function setupTouchControls() {
  const btnLeft  = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');
  const btnJump  = document.getElementById('btnJump');
  const btnBreak = document.getElementById('btnBreak');
  const btnPlace = document.getElementById('btnPlace');

  if (!btnLeft) return; // por si no existe el HTML

  // Función genérica para mantener tecla presionada mientras se toca
  function holdKey(btn, code) {
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      keysPressed[code] = true;
      btn.classList.add('pressed');
    }, { passive: false });

    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      keysPressed[code] = false;
      btn.classList.remove('pressed');
    }, { passive: false });

    btn.addEventListener('touchcancel', () => {
      keysPressed[code] = false;
      btn.classList.remove('pressed');
    });
  }

  holdKey(btnLeft,  'KeyA');
  holdKey(btnRight, 'KeyD');
  holdKey(btnJump,  'Space');

  // Botón romper: actúa sobre el bloque más cercano al jugador
  btnBreak.addEventListener('touchstart', (e) => {
    e.preventDefault();
    btnBreak.classList.add('pressed');
    const cx = Math.floor((player.x + PLAYER_SIZE / 2) / TILE_SIZE);
    const cy = Math.floor((player.y + PLAYER_SIZE / 2) / TILE_SIZE);
    // Busca el bloque sólido más cercano alrededor del jugador
    const offsets = [[0,1],[1,0],[-1,0],[0,-1],[1,1],[-1,1],[0,2]];
    for (const [dx, dy] of offsets) {
      const tx = cx + dx;
      const ty = cy + dy;
      if (tx >= 0 && tx < WORLD_WIDTH_TILES && ty >= 0 && ty < WORLD_HEIGHT_TILES) {
        const bid = world[ty][tx];
        if (bid !== 0 && BLOCK_TYPES[bid] && BLOCK_TYPES[bid].breakable) {
          breakBlock(tx, ty);
          break;
        }
      }
    }
  }, { passive: false });

  btnBreak.addEventListener('touchend', (e) => {
    e.preventDefault();
    btnBreak.classList.remove('pressed');
  }, { passive: false });

  // Botón colocar: coloca el bloque seleccionado encima o al lado del jugador
  btnPlace.addEventListener('touchstart', (e) => {
    e.preventDefault();
    btnPlace.classList.add('pressed');
    const cx = Math.floor((player.x + PLAYER_SIZE / 2) / TILE_SIZE);
    const cy = Math.floor((player.y + PLAYER_SIZE / 2) / TILE_SIZE);
    // Intenta colocar en el espacio vacío más cercano alrededor
    const offsets = [[0,-1],[1,0],[-1,0],[0,1],[1,-1],[-1,-1]];
    for (const [dx, dy] of offsets) {
      const tx = cx + dx;
      const ty = cy + dy;
      if (tx >= 0 && tx < WORLD_WIDTH_TILES && ty >= 0 && ty < WORLD_HEIGHT_TILES) {
        if (world[ty][tx] === 0) {
          const playerRect = { x: player.x, y: player.y, width: PLAYER_SIZE, height: PLAYER_SIZE };
          const tileRect   = { x: tx * TILE_SIZE, y: ty * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
          if (!checkCollision(playerRect, tileRect) && BLOCK_TYPES[selectedBlockType].placeable) {
            placeBlock(tx, ty);
            break;
          }
        }
      }
    }
  }, { passive: false });

  btnPlace.addEventListener('touchend', (e) => {
    e.preventDefault();
    btnPlace.classList.remove('pressed');
  }, { passive: false });
}

window.onload = function() {
  initGame();
  setupTouchControls();
};
