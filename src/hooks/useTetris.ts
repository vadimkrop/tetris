import { useState, useCallback, useEffect, useRef } from 'react';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINOS,
  TETROMINO_TYPES,
  POINTS,
  LEVEL_SPEEDS,
  LINES_PER_LEVEL,
  TetrominoType,
} from '../constants';
import { Board, Piece, GameState, Cell } from '../types';

const createEmptyBoard = (): Board => {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => ({ filled: false, color: '' }))
  );
};

const getRandomTetromino = (): TetrominoType => {
  return TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
};

const createPiece = (type: TetrominoType): Piece => {
  const tetromino = TETROMINOS[type];
  return {
    type,
    shape: tetromino.shape.map((row) => [...row]),
    color: tetromino.color,
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
    y: 0,
  };
};

const rotateMatrix = (matrix: number[][]): number[][] => {
  const N = matrix.length;
  const rotated = matrix.map((row, i) =>
    row.map((_, j) => matrix[N - 1 - j][i])
  );
  return rotated;
};

const isValidPosition = (
  board: Board,
  shape: number[][],
  x: number,
  y: number
): boolean => {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newX = x + col;
        const newY = y + row;
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false;
        }
        if (newY >= 0 && board[newY][newX].filled) {
          return false;
        }
      }
    }
  }
  return true;
};

export const useTetris = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoType>(getRandomTetromino());
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [ghostY, setGhostY] = useState(0);

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boardRef = useRef(board);
  const currentPieceRef = useRef(currentPiece);
  const gameStateRef = useRef(gameState);

  boardRef.current = board;
  currentPieceRef.current = currentPiece;
  gameStateRef.current = gameState;

  const calculateGhostY = useCallback((piece: Piece, currentBoard: Board): number => {
    let ghostY = piece.y;
    while (isValidPosition(currentBoard, piece.shape, piece.x, ghostY + 1)) {
      ghostY++;
    }
    return ghostY;
  }, []);

  const placePiece = useCallback((currentBoard: Board, piece: Piece): Board => {
    const newBoard = currentBoard.map((row) => row.map((cell) => ({ ...cell })));
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const y = piece.y + row;
          const x = piece.x + col;
          if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
            newBoard[y][x] = { filled: true, color: piece.color };
          }
        }
      }
    }
    return newBoard;
  }, []);

  const clearLines = useCallback((currentBoard: Board): { newBoard: Board; clearedLines: number } => {
    const newBoard = currentBoard.filter((row) =>
      row.some((cell) => !cell.filled)
    );
    const clearedLines = BOARD_HEIGHT - newBoard.length;
    const emptyRows = Array.from({ length: clearedLines }, () =>
      Array.from({ length: BOARD_WIDTH }, () => ({ filled: false, color: '' }))
    );
    return { newBoard: [...emptyRows, ...newBoard], clearedLines };
  }, []);

  const spawnPiece = useCallback(() => {
    const type = nextPiece;
    const piece = createPiece(type);
    const newNext = getRandomTetromino();

    if (!isValidPosition(boardRef.current, piece.shape, piece.x, piece.y)) {
      setGameState('gameover');
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    setCurrentPiece(piece);
    setNextPiece(newNext);
    setGhostY(calculateGhostY(piece, boardRef.current));
  }, [nextPiece, calculateGhostY]);

  const lockPiece = useCallback(() => {
    if (!currentPieceRef.current) return;

    const newBoard = placePiece(boardRef.current, currentPieceRef.current);
    const { newBoard: clearedBoard, clearedLines } = clearLines(newBoard);

    setBoard(clearedBoard);
    boardRef.current = clearedBoard;

    if (clearedLines > 0) {
      const pointsKey = clearedLines as keyof typeof POINTS;
      const earnedPoints = (POINTS[pointsKey] || 0) * level;
      setScore((prev) => prev + earnedPoints);
      setLines((prev) => {
        const newLines = prev + clearedLines;
        const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
        setLevel(Math.min(newLevel, 10));
        return newLines;
      });
    }

    setCurrentPiece(null);
    setTimeout(() => spawnPiece(), 0);
  }, [placePiece, clearLines, level, spawnPiece]);

  const moveDown = useCallback(() => {
    if (!currentPieceRef.current || gameStateRef.current !== 'playing') return;

    const piece = currentPieceRef.current;
    if (isValidPosition(boardRef.current, piece.shape, piece.x, piece.y + 1)) {
      const newPiece = { ...piece, y: piece.y + 1 };
      setCurrentPiece(newPiece);
      setGhostY(calculateGhostY(newPiece, boardRef.current));
    } else {
      lockPiece();
    }
  }, [lockPiece, calculateGhostY]);

  const moveLeft = useCallback(() => {
    if (!currentPiece || gameState !== 'playing') return;
    if (isValidPosition(board, currentPiece.shape, currentPiece.x - 1, currentPiece.y)) {
      const newPiece = { ...currentPiece, x: currentPiece.x - 1 };
      setCurrentPiece(newPiece);
      setGhostY(calculateGhostY(newPiece, board));
    }
  }, [currentPiece, board, gameState, calculateGhostY]);

  const moveRight = useCallback(() => {
    if (!currentPiece || gameState !== 'playing') return;
    if (isValidPosition(board, currentPiece.shape, currentPiece.x + 1, currentPiece.y)) {
      const newPiece = { ...currentPiece, x: currentPiece.x + 1 };
      setCurrentPiece(newPiece);
      setGhostY(calculateGhostY(newPiece, board));
    }
  }, [currentPiece, board, gameState, calculateGhostY]);

  const rotate = useCallback(() => {
    if (!currentPiece || gameState !== 'playing') return;
    const rotated = rotateMatrix(currentPiece.shape);
    
    // Wall kick: try original position, then left, then right
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (isValidPosition(board, rotated, currentPiece.x + kick, currentPiece.y)) {
        const newPiece = {
          ...currentPiece,
          shape: rotated,
          x: currentPiece.x + kick,
        };
        setCurrentPiece(newPiece);
        setGhostY(calculateGhostY(newPiece, board));
        return;
      }
    }
  }, [currentPiece, board, gameState, calculateGhostY]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameState !== 'playing') return;
    const dropY = calculateGhostY(currentPiece, board);
    const droppedPiece = { ...currentPiece, y: dropY };
    const distance = dropY - currentPiece.y;
    setScore((prev) => prev + distance * 2);
    setCurrentPiece(droppedPiece);
    currentPieceRef.current = droppedPiece;
    lockPiece();
  }, [currentPiece, board, gameState, calculateGhostY, lockPiece]);

  const startGame = useCallback(() => {
    const emptyBoard = createEmptyBoard();
    setBoard(emptyBoard);
    boardRef.current = emptyBoard;
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameState('playing');
    setCurrentPiece(null);
    setNextPiece(getRandomTetromino());

    setTimeout(() => {
      const type = getRandomTetromino();
      const piece = createPiece(type);
      setCurrentPiece(piece);
      setNextPiece(getRandomTetromino());
      setGhostY(calculateGhostY(piece, emptyBoard));
    }, 0);
  }, [calculateGhostY]);

  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      const speed = LEVEL_SPEEDS[level] || 100;
      gameLoopRef.current = setInterval(() => {
        moveDown();
      }, speed);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState, level, moveDown]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' && e.key !== 'Enter') return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveDown();
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
        case 'Escape':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, moveLeft, moveRight, moveDown, rotate, hardDrop, togglePause]);

  const getDisplayBoard = useCallback((): Cell[][] => {
    const display = board.map((row) => row.map((cell) => ({ ...cell })));

    // Draw ghost piece
    if (currentPiece && gameState === 'playing') {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const y = ghostY + row;
            const x = currentPiece.x + col;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH && !display[y][x].filled) {
              display[y][x] = { filled: false, color: currentPiece.color + '40' };
            }
          }
        }
      }
    }

    // Draw current piece
    if (currentPiece) {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const y = currentPiece.y + row;
            const x = currentPiece.x + col;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              display[y][x] = { filled: true, color: currentPiece.color };
            }
          }
        }
      }
    }

    return display;
  }, [board, currentPiece, ghostY, gameState]);

  return {
    board: getDisplayBoard(),
    currentPiece,
    nextPiece,
    gameState,
    score,
    lines,
    level,
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
  };
};
