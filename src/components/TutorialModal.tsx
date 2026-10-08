import { useEffect } from 'react';

type TutorialModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TutorialModal = ({ isOpen, onClose }: TutorialModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border-2 border-purple-500 rounded-2xl shadow-2xl shadow-purple-500/30 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/30">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            📖 Как играть
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
            aria-label="Закрыть"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Цель игры */}
          <div>
            <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">🎯</span> Цель игры
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Управляйте падающими фигурами, заполняйте горизонтальные линии. 
              Заполненные линии исчезают, давая вам очки.
            </p>
          </div>

          {/* Управление */}
          <div>
            <h3 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
              <span className="text-xl">🎮</span> Управление
            </h3>
            
            {/* Desktop */}
            <div className="mb-4">
              <p className="text-cyan-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                Клавиатура (ПК)
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm font-mono min-w-[60px] text-center">
                    ← →
                  </kbd>
                  <span className="text-gray-300 text-sm">Двигать фигуру</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm font-mono min-w-[60px] text-center">
                    ↑
                  </kbd>
                  <span className="text-gray-300 text-sm">Повернуть фигуру</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm font-mono min-w-[60px] text-center">
                    ↓
                  </kbd>
                  <span className="text-gray-300 text-sm">Ускорить падение</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-white text-xs font-mono min-w-[60px] text-center">
                    Space
                  </kbd>
                  <span className="text-gray-300 text-sm">Мгновенный бросок</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm font-mono min-w-[60px] text-center">
                    P / Esc
                  </kbd>
                  <span className="text-gray-300 text-sm">Пауза</span>
                </div>
              </div>
            </div>

            {/* Mobile */}
            <div>
              <p className="text-cyan-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                Кнопки (мобильные)
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600/80 rounded-lg flex items-center justify-center text-white text-xl">
                    ↻
                  </div>
                  <span className="text-gray-300 text-sm">Повернуть</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/80 rounded-lg flex items-center justify-center text-white text-xl">
                    ← → ↓
                  </div>
                  <span className="text-gray-300 text-sm">Двигать и ускорить</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600/80 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    ⏬
                  </div>
                  <span className="text-gray-300 text-sm">Мгновенный бросок</span>
                </div>
              </div>
            </div>
          </div>

          {/* Очки */}
          <div>
            <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">⭐</span> Очки
            </h3>
            <div className="space-y-1 text-sm text-gray-300">
              <p>• 1 линия = 100 × уровень</p>
              <p>• 2 линии = 300 × уровень</p>
              <p>• 3 линии = 500 × уровень</p>
              <p>• 4 линии (Тетрис!) = 800 × уровень</p>
              <p>• Бросок = +2 за каждую клетку</p>
            </div>
          </div>

          {/* Уровни */}
          <div>
            <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">📈</span> Уровни
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Каждые <span className="text-cyan-400 font-semibold">10 линий</span> вы переходите 
              на следующий уровень. С каждым уровнем фигуры падают быстрее, но скорость 
              увеличивается только для <span className="text-cyan-400 font-semibold">следующей фигуры</span>, 
              давая вам время подготовиться. Максимальный уровень — 10.
            </p>
          </div>

          {/* Советы */}
          <div>
            <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span> Советы
            </h3>
            <ul className="space-y-1 text-sm text-gray-300 list-disc list-inside">
              <li>Старайтесь заполнять линии полностью</li>
              <li>Не оставляйте дыр в заполненных рядах</li>
              <li>Используйте бросок для быстрого размещения</li>
              <li>4 линии сразу (Тетрис) дают больше всего очков</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-purple-500/30">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-400 hover:to-pink-400 transition-all transform hover:scale-105 shadow-lg"
          >
            Понятно, играть!
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
