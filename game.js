/* ============================================
   PUZZLE DE FLORES — Para Yaressi 💛
   Basado en el Sliding Puzzle original,
   adaptado con tema de flores amarillas
   ============================================ */

const container  = document.getElementById('puzzle-container')
const startBtn   = document.getElementById('start-button')
const moveCountEl = document.getElementById('move-count')

// Imágenes de flores/naturaleza para el puzzle
const FLOWER_IMAGES = [
  'https://picsum.photos/seed/sunflower1/400',
  'https://picsum.photos/seed/flowers2/400',
  'https://picsum.photos/seed/nature3/400',
  'https://picsum.photos/seed/garden4/400',
  'https://picsum.photos/seed/bloom5/400',
]

let size, imgURL, debug
let board = []
let moves = 0
let imageIndex = 0

startBtn.addEventListener('click', () => initGame(false))

function initGame(autoRestart) {
  debug = document.getElementById('debug-toggle').checked
  size  = parseInt(document.getElementById('grid-size').value)
  moves = 0
  if (moveCountEl) moveCountEl.textContent = '0'

  if (autoRestart) {
    imgURL = FLOWER_IMAGES[imageIndex % FLOWER_IMAGES.length]
    imageIndex++
  } else {
    imgURL = FLOWER_IMAGES[imageIndex % FLOWER_IMAGES.length]
    imageIndex++
  }

  container.style.gridTemplateColumns = `repeat(${size}, 1fr)`
  container.style.gridTemplateRows    = `repeat(${size}, 1fr)`

  board = []
  for (let i = 0; i < size * size - 1; i++) board.push(i + 1)
  shuffle(board)
  board.push(null)

  drawBoard()
}

function drawBoard() {
  container.innerHTML = ''
  const containerSize = container.offsetWidth || 400

  board.forEach((num, idx) => {
    const tile = document.createElement('div')
    tile.className = 'tile'

    if (num === null) {
      tile.classList.add('empty')
    } else if (debug) {
      tile.textContent = num
      tile.style.background = '#1a3520'
      tile.style.color = '#FFD700'
      tile.style.fontSize = `${Math.max(10, 28 - size * 2)}px`
    } else {
      const row = Math.floor((num - 1) / size)
      const col = (num - 1) % size

      tile.style.backgroundImage    = `url(${imgURL})`
      tile.style.backgroundPosition = `${(col * 100) / (size - 1)}% ${(row * 100) / (size - 1)}%`
      tile.style.backgroundSize     = `${size * 100}% ${size * 100}%`

      // Número pequeño encima de la imagen
      if (size <= 5) {
        const numEl = document.createElement('span')
        numEl.className   = 'tile-number'
        numEl.textContent = num
        tile.appendChild(numEl)
      }
    }

    tile.addEventListener('click', () => handleMove(idx))
    container.appendChild(tile)
  })

  container.classList.remove('fade-in')
  void container.offsetWidth  // reflow
  container.classList.add('fade-in')
}

function handleMove(clickedIndex) {
  const emptyIndex = board.indexOf(null)
  if (isAdjacent(clickedIndex, emptyIndex)) {
    ;[board[clickedIndex], board[emptyIndex]] = [board[emptyIndex], board[clickedIndex]]
    moves++
    if (moveCountEl) moveCountEl.textContent = moves
    drawBoard()
    if (checkWin()) setTimeout(showWin, 200)
  }
}

function isAdjacent(i1, i2) {
  const x1 = i1 % size, y1 = Math.floor(i1 / size)
  const x2 = i2 % size, y2 = Math.floor(i2 / size)
  return Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1
}

function checkWin() {
  for (let i = 0; i < board.length - 1; i++) {
    if (board[i] !== i + 1) return false
  }
  return true
}

function showWin() {
  // Mostrar imagen completa en el puzzle
  container.innerHTML = ''
  const img = document.createElement('img')
  img.src             = imgURL
  img.style.width     = '100%'
  img.style.height    = '100%'
  img.style.objectFit = 'cover'
  img.style.borderRadius = '14px'
  container.appendChild(img)

  // Overlay de victoria
  const overlay = document.createElement('div')
  overlay.className = 'win-message'
  overlay.innerHTML = `
    <div class="win-box">
      <div class="win-title">¡Lo lograste! 🌼</div>
      <div class="win-sub">¡Eres increíble, Yaressi! 💛</div>
      <div class="win-score">Movimientos: <span>${moves}</span></div>
    </div>
  `
  document.body.appendChild(overlay)

  // Siguiente imagen en 2.5s
  setTimeout(() => {
    overlay.remove()
    initGame(true)
  }, 2500)
}

function shuffle(array) {
  let n = array.length
  while (n) {
    const i = Math.floor(Math.random() * n--)
    ;[array[n], array[i]] = [array[i], array[n]]
  }
}

document.addEventListener('DOMContentLoaded', () => {
  container.classList.add('fade-in')
  setTimeout(() => initGame(true), 400)
})
