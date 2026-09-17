import { useTetris } from './hooks/useTetris';
import { TETROMINOS, TetrominoType, BOARD_WIDTH, BOARD_HEIGHT } from './constants';
import FeedbackWidget from './components/FeedbackWidget';
import { useEffect, useState, useCallback } from 'react';

function NextPieceDisplay({ type }: { type: TetrominoType }) {
  const tetromino = TETROMINOS[type];
  const shape = tetromino.shape;

  return (
    <div className="flex flex-col items-center">
      {shape.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className="w-4 h-4 md:w-5 md:h-5 border border-gray-700"
              style={{
                backgroundColor: cell ? tetromino.color : 'transparent',
                boxShadow: cell ? `inset 0 0 4px rgba(255,255,255,0.3)` : 'none',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Адаптивный размер ячейки в зависимости от экрана
const useCellSize = () => {
  const [cellSize, setCellSize] = useState(30);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (width < 640) {
        // Мобильные: поле должно занимать верхнюю часть экрана
        // Оставляем место для кнопок (~240px) и заголовка (~80px)
        const availableHeight = height - 320;
        const availableWidth = width - 32; // отступы по бокам

        const sizeByWidth = Math.floor(availableWidth / BOARD_WIDTH);
        const sizeByHeight = Math.floor(availableHeight / BOARD_HEIGHT);

        const size = Math.min(sizeByWidth, sizeByHeight, 30);
        setCellSize(Math.max(size, 16));
      } else {
        setCellSize(30);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return cellSize;
};

function App() {
  const {
    board,
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
  } = useTetris();

  const cellSize = useCellSize();
  const [activeButton, setActiveButton] = useState<string | null>(null);

  // Обработка нажатий кнопок с визуальной обратной связью
  const handleButtonPress = useCallback((name: string, action: () => void) => {
    setActiveButton(name);
    action();
    setTimeout(() => setActiveButton(null), 150);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center p-2 md:p-4 select-none overflow-hidden">
      {/* Title */}
      <h1 className="text-2xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-2 md:mb-6 tracking-wider">
        ТЕТРИС
      </h1>

      {/* Mobile Stats Bar */}
      <div className="md:hidden w-full max-w-sm flex justify-between items-center mb-2 px-2 gap-2">
        <div className="flex-1 bg-gray-800/80 rounded-lg px-3 py-1.5 border border-purple-500/30 text-center">
          <div className="text-[10px] text-purple-300 uppercase tracking-wider">Очки</div>
          <div className="text-white font-bold text-sm font-mono">{score.toLocaleString()}</div>
        </div>
        <div className="flex-1 bg-gray-800/80 rounded-lg px-3 py-1.5 border border-purple-500/30 text-center">
          <div className="text-[10px] text-purple-300 uppercase tracking-wider">Уровень</div>
          <div className="text-cyan-400 font-bold text-sm font-mono">{level}</div>
        </div>
        <div className="flex-1 bg-gray-800/80 rounded-lg px-3 py-1.5 border border-purple-500/30 text-center">
          <div className="text-[10px] text-purple-300 uppercase tracking-wider">Линии</div>
          <div className="text-green-400 font-bold text-sm font-mono">{lines}</div>
        </div>
        <div className="bg-gray-800/80 rounded-lg px-2 py-1.5 border border-purple-500/30 flex items-center gap-2">
          <NextPieceDisplay type={nextPiece} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start">
        {/* Game Board */}
        <div className="relative">
          <div
            className="border-2 border-purple-500 rounded-lg overflow-hidden shadow-2xl shadow-purple-500/20"
            style={{
              width: BOARD_WIDTH * cellSize,
              height: BOARD_HEIGHT * cellSize,
            }}
          >
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className="border border-gray-800/50"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: cell.filled
                        ? cell.color
                        : cell.color
                        ? cell.color
                        : 'rgba(17, 24, 39, 0.8)',
                      boxShadow: cell.filled
                        ? `inset 0 0 6px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.3)`
                        : 'none',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Overlays */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
              <div className="text-center px-4">
                <p className="text-white text-lg md:text-xl mb-4">Готовы играть?</p>
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-400 hover:to-emerald-500 transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
                >
                  ▶ Начать игру
                </button>
              </div>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
              <div className="text-center">
                <p className="text-yellow-400 text-xl md:text-2xl font-bold mb-4">⏸ ПАУЗА</p>
                <button
                  onClick={togglePause}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-400 hover:to-indigo-500 transition-all text-sm md:text-base"
                >
                  Продолжить
                </button>
              </div>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
              <div className="text-center px-4">
                <p className="text-red-400 text-2xl md:text-3xl font-bold mb-2">ИГРА ОКОНЧЕНА</p>
                <p className="text-white text-base md:text-lg mb-1">Очки: {score}</p>
                <p className="text-gray-300 mb-4">Линии: {lines}</p>
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-400 hover:to-emerald-500 transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
                >
                  🔄 Играть снова
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Side Panel */}
        <div className="hidden md:flex flex-col gap-4 min-w-[160px]">
          <div className="bg-gray-800/80 backdrop-blur rounded-lg p-4 border border-purple-500/30">
            <h3 className="text-purple-300 text-sm font-semibold mb-3 text-center uppercase tracking-wider">
              Следующая
            </h3>
            <div className="flex justify-center">
              <NextPieceDisplay type={nextPiece} />
            </div>
          </div>

          <div className="bg-gray-800/80 backdrop-blur rounded-lg p-4 border border-purple-500/30">
            <h3 className="text-purple-300 text-sm font-semibold mb-2 uppercase tracking-wider">
              Очки
            </h3>
            <p className="text-white text-2xl font-bold font-mono">{score.toLocaleString()}</p>
          </div>

          <div className="bg-gray-800/80 backdrop-blur rounded-lg p-4 border border-purple-500/30">
            <h3 className="text-purple-300 text-sm font-semibold mb-2 uppercase tracking-wider">
              Уровень
            </h3>
            <p className="text-cyan-400 text-2xl font-bold font-mono">{level}</p>
          </div>

          <div className="bg-gray-800/80 backdrop-blur rounded-lg p-4 border border-purple-500/30">
            <h3 className="text-purple-300 text-sm font-semibold mb-2 uppercase tracking-wider">
              Линии
            </h3>
            <p className="text-green-400 text-2xl font-bold font-mono">{lines}</p>
          </div>

          {gameState === 'playing' && (
            <button
              onClick={togglePause}
              className="px-4 py-2 bg-yellow-600/80 text-white font-semibold rounded-lg hover:bg-yellow-500/80 transition-all text-sm"
            >
              ⏸ Пауза
            </button>
          )}
        </div>
      </div>

      {/* Mobile Controls */}
      {gameState === 'playing' && (
        <div className="md:hidden w-full max-w-sm mt-3 px-2">
          <div className="grid grid-cols-5 gap-2">
            {/* Row 1: Rotate + Pause + Hard Drop */}
            <button
              onTouchStart={() => handleButtonPress('rotate', rotate)}
              className={`col-span-1 h-14 rounded-xl font-bold text-white text-2xl transition-all ${
                activeButton === 'rotate'
                  ? 'bg-purple-400 scale-95'
                  : 'bg-purple-600/80 active:bg-purple-500 active:scale-95'
              } shadow-lg shadow-purple-500/20`}
            >
              ↻
            </button>
            <button
              onTouchStart={() => handleButtonPress('left', moveLeft)}
              className={`col-span-1 h-14 rounded-xl font-bold text-white text-2xl transition-all ${
                activeButton === 'left'
                  ? 'bg-blue-400 scale-95'
                  : 'bg-blue-600/80 active:bg-blue-500 active:scale-95'
              } shadow-lg shadow-blue-500/20`}
            >
              ←
            </button>
            <button
              onTouchStart={() => handleButtonPress('down', moveDown)}
              className={`col-span-1 h-14 rounded-xl font-bold text-white text-2xl transition-all ${
                activeButton === 'down'
                  ? 'bg-blue-400 scale-95'
                  : 'bg-blue-600/80 active:bg-blue-500 active:scale-95'
              } shadow-lg shadow-blue-500/20`}
            >
              ↓
            </button>
            <button
              onTouchStart={() => handleButtonPress('right', moveRight)}
              className={`col-span-1 h-14 rounded-xl font-bold text-white text-2xl transition-all ${
                activeButton === 'right'
                  ? 'bg-blue-400 scale-95'
                  : 'bg-blue-600/80 active:bg-blue-500 active:scale-95'
              } shadow-lg shadow-blue-500/20`}
            >
              →
            </button>
            <button
              onTouchStart={() => handleButtonPress('drop', hardDrop)}
              className={`col-span-1 h-14 rounded-xl font-bold text-white text-sm transition-all ${
                activeButton === 'drop'
                  ? 'bg-red-400 scale-95'
                  : 'bg-red-600/80 active:bg-red-500 active:scale-95'
              } shadow-lg shadow-red-500/20`}
            >
              ⏬
            </button>
          </div>
        </div>
      )}

      {/* Desktop Instructions */}
      <div className="mt-4 md:mt-6 text-center text-gray-400 text-sm hidden md:block">
        <p className="mb-1">
          <span className="text-purple-300 font-semibold">←→</span> — движение{' '}
          <span className="text-purple-300 font-semibold">↑</span> — поворот{' '}
          <span className="text-purple-300 font-semibold">↓</span> — ускорение{' '}
          <span className="text-purple-300 font-semibold">Пробел</span> — бросок
        </p>
        <p>
          <span className="text-purple-300 font-semibold">P / Esc</span> — пауза
        </p>
      </div>

      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
}

export default App;
