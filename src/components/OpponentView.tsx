import { PlayerState } from '../hooks/useMultiplayer';
import { TETROMINOS, TetrominoType } from '../constants';

type OpponentViewProps = {
  opponentState: PlayerState | null;
  isMobile?: boolean;
};

const OpponentView = ({ opponentState, isMobile = false }: OpponentViewProps) => {
  if (!opponentState) {
    return (
      <div className="bg-gray-800/60 backdrop-blur rounded-lg p-4 border border-purple-500/30">
        <p className="text-gray-400 text-center text-sm">Ожидание противника...</p>
      </div>
    );
  }

  const { score, lines, level, board, isAlive, nextPiece } = opponentState;

  // Мобильная версия - только статистика
  if (isMobile) {
    return (
      <div className="bg-gray-800/80 backdrop-blur rounded-lg p-3 border border-purple-500/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-purple-300 text-xs font-semibold uppercase tracking-wider">
            Противник
          </h3>
          {!isAlive && (
            <span className="text-red-400 text-xs font-bold">💀 Проиграл</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] text-gray-400 uppercase">Очки</div>
            <div className="text-white font-bold text-sm font-mono">{score.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase">Уровень</div>
            <div className="text-cyan-400 font-bold text-sm font-mono">{level}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase">Линии</div>
            <div className="text-green-400 font-bold text-sm font-mono">{lines}</div>
          </div>
        </div>
      </div>
    );
  }

  // Десктопная версия - полное поле
  const cellSize = 12; // Маленькие ячейки для поля противника

  return (
    <div className="bg-gray-800/80 backdrop-blur rounded-lg p-4 border border-purple-500/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-purple-300 text-sm font-semibold uppercase tracking-wider">
          Противник
        </h3>
        {!isAlive && (
          <span className="text-red-400 text-sm font-bold animate-pulse">💀 Проиграл</span>
        )}
      </div>

      {/* Поле противника */}
      <div
        className="border border-gray-600 rounded overflow-hidden mb-3 mx-auto"
        style={{
          width: 10 * cellSize,
          height: 20 * cellSize,
        }}
      >
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: cell ? '#a000f0' : 'rgba(17, 24, 39, 0.8)',
                  boxShadow: cell ? 'inset 0 0 3px rgba(255,255,255,0.2)' : 'none',
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[10px] text-gray-400 uppercase">Очки</div>
          <div className="text-white font-bold text-sm font-mono">{score.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 uppercase">Уровень</div>
          <div className="text-cyan-400 font-bold text-sm font-mono">{level}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 uppercase">Линии</div>
          <div className="text-green-400 font-bold text-sm font-mono">{lines}</div>
        </div>
      </div>

      {/* Следующая фигура */}
      <div className="mt-3 pt-3 border-t border-purple-500/20">
        <div className="text-[10px] text-gray-400 uppercase mb-2 text-center">Следующая</div>
        <div className="flex justify-center">
          {nextPiece && TETROMINOS[nextPiece as TetrominoType] && (
            <div className="flex flex-col">
              {TETROMINOS[nextPiece as TetrominoType].shape.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => (
                    <div
                      key={colIndex}
                      className="w-3 h-3"
                      style={{
                        backgroundColor: cell ? TETROMINOS[nextPiece as TetrominoType].color : 'transparent',
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpponentView;
