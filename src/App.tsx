import { useTetris } from './hooks/useTetris';
import { TETROMINOS, TetrominoType, BOARD_WIDTH, BOARD_HEIGHT } from './constants';
import FeedbackWidget from './components/FeedbackWidget';

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
              className="w-5 h-5 border border-gray-700"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-4">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-6 tracking-wider">
        ТЕТРИС
      </h1>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Game Board */}
        <div className="relative">
          <div
            className="border-2 border-purple-500 rounded-lg overflow-hidden shadow-2xl shadow-purple-500/20"
            style={{
              width: BOARD_WIDTH * 30,
              height: BOARD_HEIGHT * 30,
            }}
          >
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className="border border-gray-800/50"
                    style={{
                      width: 30,
                      height: 30,
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
              <div className="text-center">
                <p className="text-white text-xl mb-4">Готовы играть?</p>
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-400 hover:to-emerald-500 transition-all transform hover:scale-105 shadow-lg"
                >
                  ▶ Начать игру
                </button>
              </div>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
              <div className="text-center">
                <p className="text-yellow-400 text-2xl font-bold mb-4">⏸ ПАУЗА</p>
                <button
                  onClick={togglePause}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-400 hover:to-indigo-500 transition-all"
                >
                  Продолжить
                </button>
              </div>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
              <div className="text-center">
                <p className="text-red-400 text-3xl font-bold mb-2">ИГРА ОКОНЧЕНА</p>
                <p className="text-white text-lg mb-1">Очки: {score}</p>
                <p className="text-gray-300 mb-4">Линии: {lines}</p>
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-400 hover:to-emerald-500 transition-all transform hover:scale-105 shadow-lg"
                >
                  🔄 Играть снова
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="flex flex-col gap-4 min-w-[160px]">
          {/* Next Piece */}
          <div className="bg-gray-800/80 backdrop-blur rounded-lg p-4 border border-purple-500/30">
            <h3 className="text-purple-300 text-sm font-semibold mb-3 text-center uppercase tracking-wider">
              Следующая
            </h3>
            <div className="flex justify-center">
              <NextPieceDisplay type={nextPiece} />
            </div>
          </div>

          {/* Score */}
          <div className="bg-gray-800/80 backdrop-blur rounded-lg p-4 border border-purple-500/30">
            <h3 className="text-purple-300 text-sm font-semibold mb-2 uppercase tracking-wider">
              Очки
            </h3>
            <p className="text-white text-2xl font-bold font-mono">{score.toLocaleString()}</p>
          </div>

          {/* Level */}
          <div className="bg-gray-800/80 backdrop-blur rounded-lg p-4 border border-purple-500/30">
            <h3 className="text-purple-300 text-sm font-semibold mb-2 uppercase tracking-wider">
              Уровень
            </h3>
            <p className="text-cyan-400 text-2xl font-bold font-mono">{level}</p>
          </div>

          {/* Lines */}
          <div className="bg-gray-800/80 backdrop-blur rounded-lg p-4 border border-purple-500/30">
            <h3 className="text-purple-300 text-sm font-semibold mb-2 uppercase tracking-wider">
              Линии
            </h3>
            <p className="text-green-400 text-2xl font-bold font-mono">{lines}</p>
          </div>

          {/* Controls */}
          {gameState === 'playing' && (
            <button
              onClick={togglePause}
              className="px-4 py-2 bg-yellow-600/80 text-white font-semibold rounded-lg hover:bg-yellow-500/80 transition-all text-sm"
            >
              ⏸ Пауза
            </button>
          )}

          {/* Mobile Controls */}
          <div className="md:hidden flex flex-col gap-2 mt-4">
            <div className="flex justify-center gap-2">
              <button
                onClick={rotate}
                className="w-14 h-14 bg-purple-600/80 text-white font-bold rounded-lg active:bg-purple-500 text-xl"
              >
                ↻
              </button>
            </div>
            <div className="flex justify-center gap-2">
              <button
                onClick={moveLeft}
                className="w-14 h-14 bg-blue-600/80 text-white font-bold rounded-lg active:bg-blue-500 text-xl"
              >
                ←
              </button>
              <button
                onClick={hardDrop}
                className="w-14 h-14 bg-red-600/80 text-white font-bold rounded-lg active:bg-red-500 text-sm"
              >
                ⬇⬇
              </button>
              <button
                onClick={moveRight}
                className="w-14 h-14 bg-blue-600/80 text-white font-bold rounded-lg active:bg-blue-500 text-xl"
              >
                →
              </button>
            </div>
            <div className="flex justify-center">
              <button
                onClick={moveDown}
                className="w-14 h-14 bg-blue-600/80 text-white font-bold rounded-lg active:bg-blue-500 text-xl"
              >
                ↓
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-gray-400 text-sm hidden md:block">
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
