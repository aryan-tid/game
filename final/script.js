const mainBoard = document.getElementById('main-board');
const statusDisplay = document.getElementById('status');
const aiToggleButton = document.getElementById('ai-toggle');
const aiModeDisplay = document.getElementById('ai-toggle');
const clickSound = new Audio('click-sound.mp3'); // Path to click sound
const winSound = new Audio('win-sound.mp3'); // Path to win sound
const aiMoveSound = new Audio('ai-move-sound.mp3'); // Path to AI move sound

let currentPlayer = 'X';
let activeBoard = null; // Determines the next board to play
let gameState = Array(9).fill(null).map(() => Array(9).fill(''));
let boardWinners = Array(9).fill(null);
let isAI = false; // Flag to check if AI is playing
let isGameOver = false;

// Initialize the main board
function createMainBoard() {
  for (let i = 0; i < 9; i++) {
    const board = document.createElement('div');
    board.classList.add('board');
    board.dataset.index = i;
    for (let j = 0; j < 9; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.cellIndex = j;
      cell.addEventListener('click', () => handleCellClick(i, j));
      board.appendChild(cell);
    }
    mainBoard.appendChild(board);
  }
}

// Handle cell clicks with animations
function handleCellClick(boardIndex, cellIndex) {
  if (isGameOver || boardWinners[boardIndex] || gameState[boardIndex][cellIndex] || (activeBoard !== null && activeBoard !== boardIndex)) {
    return;
  }

  const board = mainBoard.children[boardIndex];
  const cell = board.children[cellIndex];

  // Play click sound
  clickSound.play();

  // Zoom out the current active board
  board.classList.add('zoom-out');
  setTimeout(() => board.classList.remove('zoom-out'), 400);

  // Update game state
  gameState[boardIndex][cellIndex] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase(), 'disabled');

  // Check if the current board is won
  if (checkWinner(gameState[boardIndex])) {
    boardWinners[boardIndex] = currentPlayer;
    board.classList.add('disabled');
    board.style.backgroundColor = currentPlayer === 'X' ? '#ace1af' : '#f5a9a9';
  }

  // Check if the entire game is won
  if (checkWinner(boardWinners)) {
    winSound.play();
    statusDisplay.textContent = `${currentPlayer} wins the game! 🎉`;
    mainBoard.style.pointerEvents = 'none'; // Disable further interaction
    isGameOver = true;
    return;
  }

  // Update active board
  activeBoard = boardWinners[cellIndex] || gameState[cellIndex].includes('') ? cellIndex : null;

  // If the target board is won/full, allow any board to be played
  if (boardWinners[activeBoard] || !gameState[activeBoard].includes('')) {
    activeBoard = null;
  }

  // Zoom in the new active board
  updateBoardStyles();

  // Update turn
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusDisplay.textContent = `Next turn: ${currentPlayer}`;

  // If it's AI's turn and the game is not over, let AI make a move
  if (isAI && currentPlayer === 'O' && !isGameOver) {
    setTimeout(aiMove, 500);
  }
}

// Check if a board has a winner
function checkWinner(board) {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  return winPatterns.some(pattern =>
    pattern.every(index => board[index] === currentPlayer)
  );
}

// Update the board styles based on the active board
function updateBoardStyles() {
  Array.from(mainBoard.children).forEach((board, index) => {
    board.classList.remove('active');
    board.classList.add('disabled');
    if (activeBoard === null || activeBoard === index) {
      board.classList.remove('disabled');
      if (activeBoard === index) board.classList.add('active');
    }
  });
}

// AI Move (simple random move)
// AI Move using Minimax for Super Tic-Tac-Toe
function aiMove() {
    let availableMoves = [];
    
    // If there is an active board (determined by the opponent's last move)
    if (activeBoard !== null) {
      // Look for available moves in the active board
      gameState[activeBoard].forEach((cell, cellIndex) => {
        if (cell === '') {
          availableMoves.push({ boardIndex: activeBoard, cellIndex });
        }
      });
    } else {
      // If no active board (opponent played on a finished board), search all boards
      gameState.forEach((board, boardIndex) => {
        if (boardWinners[boardIndex] === null) {
          board.forEach((cell, cellIndex) => {
            if (cell === '') {
              availableMoves.push({ boardIndex, cellIndex });
            }
          });
        }
      });
    }
  
    // If there are no available moves, return (game is over)
    if (availableMoves.length === 0) return;
  
    let bestMove = null;
    let bestValue = -Infinity;
  
    // Loop through all available moves and find the best move
    availableMoves.forEach(({ boardIndex, cellIndex }) => {
      const board = gameState[boardIndex];
      board[cellIndex] = 'O'; // Make the move
      const moveValue = minimax(board, 0, false); // Evaluate the move
      board[cellIndex] = ''; // Undo the move
  
      if (moveValue > bestValue) {
        bestValue = moveValue;
        bestMove = { boardIndex, cellIndex };
      }
    });
  
    // Execute the best move
    if (bestMove) {
      const { boardIndex, cellIndex } = bestMove;
      const board = mainBoard.children[boardIndex];
      const cell = board.children[cellIndex];
  
      // Play AI move sound
      aiMoveSound.play();
  
      // Make the AI move
      gameState[boardIndex][cellIndex] = 'O';
      cell.textContent = 'O';
      cell.classList.add('o', 'disabled');
  
      // Check if the current board is won
      if (checkWinner(gameState[boardIndex])) {
        boardWinners[boardIndex] = 'O';
        board.classList.add('disabled');
        board.style.backgroundColor = '#f5a9a9';
      }
  
      // Check if the entire game is won
      if (checkWinner(boardWinners)) {
        winSound.play();
        statusDisplay.textContent = `O wins the game! 🎉`;
        mainBoard.style.pointerEvents = 'none'; // Disable further interaction
        isGameOver = true;
        return;
      }
  
      // Update active board
      activeBoard = gameState[boardIndex][cellIndex] === 'O' ? cellIndex : null;
  
      // If the target board is won/full, allow any board to be played
      if (boardWinners[activeBoard] || !gameState[activeBoard].includes('')) {
        activeBoard = null;
      }
  
      // Zoom in the new active board
      updateBoardStyles();
  
      // Update turn
      currentPlayer = 'X';
      statusDisplay.textContent = `Next turn: ${currentPlayer}`;
    }
  }
  
  // Modified Minimax function to work with Super Tic-Tac-Toe
  function minimax(board, depth, isMaximizingPlayer) {
    const winner = checkWinner(board);
    if (winner === 'O') return 1; // AI wins
    if (winner === 'X') return -1; // Opponent wins
    if (board.every(cell => cell !== '')) return 0; // Draw
  
    if (isMaximizingPlayer) {
      let best = -Infinity;
      // Maximizing for AI ('O')
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = 'O'; // Make the move
          best = Math.max(best, minimax(board, depth + 1, false)); // Call minimax recursively
          board[i] = ''; // Undo the move
        }
      }
      return best;
    } else {
      let best = Infinity;
      // Minimizing for opponent ('X')
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = 'X'; // Make the move
          best = Math.min(best, minimax(board, depth + 1, true)); // Call minimax recursively
          board[i] = ''; // Undo the move
        }
      }
      return best;
    }
  }
  

// Toggle between Player vs Player and Player vs AI
function toggleAI() {
  if (isAI) {
    // If AI is already on, turn off and reset the game
    isAI = false;
    aiModeDisplay.textContent = "Playing with Player";
    resetGame();
  } else {
    // Confirm game reset if switching to AI
    const confirmReset = confirm("Do you want to restart the game to play with AI?");
    if (confirmReset) {
      isAI = true;
      aiModeDisplay.textContent = "Playing with AI";
      resetGame();
    }
  }
}

// Reset the game state
function resetGame() {
    isGameOver = false;
    gameState = Array(9).fill(null).map(() => Array(9).fill(''));
    boardWinners = Array(9).fill(null);
    currentPlayer = 'X';
    activeBoard = null;
    updateBoardStyles();
    statusDisplay.textContent = `Next turn: ${currentPlayer}`;
  
    // Clear the cells on the board
    Array.from(mainBoard.children).forEach((board, boardIndex) => {
      Array.from(board.children).forEach((cell, cellIndex) => {
        cell.textContent = ''; // Clear the cell content
        cell.classList.remove('x', 'o', 'disabled'); // Remove X, O, and disabled classes
      });
    });
  }
  

// Display AI mode (to show current state)
function updateAIStatus() {
  aiModeDisplay.textContent = isAI ? "Playing with AI" : "Playing with Player";
}

// Initialize game
createMainBoard();
updateBoardStyles();
statusDisplay.textContent = `Next turn: ${currentPlayer}`;
aiModeDisplay.textContent = isAI ? "Playing with AI" : "Playing with Player";

aiToggleButton.addEventListener('click', toggleAI);
