import { useState } from 'react';
import { MultiplayerStatus } from '../hooks/useMultiplayer';

type MultiplayerMenuProps = {
  status: MultiplayerStatus;
  roomCode: string;
  errorMessage: string;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onDisconnect: () => void;
  onClose: () => void;
};

const MultiplayerMenu = ({
  status,
  roomCode,
  errorMessage,
  onCreateRoom,
  onJoinRoom,
  onDisconnect,
  onClose,
}: MultiplayerMenuProps) => {
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');

  const handleJoin = () => {
    if (joinCode.trim()) {
      onJoinRoom(joinCode.trim().toUpperCase());
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomCode);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border-2 border-purple-500 rounded-2xl shadow-2xl shadow-purple-500/30 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/30">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            🎮 Мультиплеер
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
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
        <div className="p-6">
          {/* Not configured */}
          {status === 'not_configured' && (
            <div className="text-center">
              <div className="text-5xl mb-4">⚙️</div>
              <h3 className="text-yellow-400 font-bold text-lg mb-2">
                Мультиплеер не настроен
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Для работы мультиплеера необходимо настроить Supabase.
                Обратитесь к README.md для инструкций.
              </p>
              <div className="bg-gray-800 rounded-lg p-3 text-left text-xs text-gray-400 font-mono">
                <p>1. Создайте таблицы в Supabase SQL Editor</p>
                <p>2. Добавьте переменные окружения на Vercel:</p>
                <p className="ml-2">VITE_SUPABASE_URL</p>
                <p className="ml-2">VITE_SUPABASE_ANON_KEY</p>
                <p>3. Redeploy проект</p>
              </div>
            </div>
          )}

          {/* Выбор режима */}
          {mode === 'select' && status !== 'not_configured' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-center mb-6">
                Играйте с друзьями в реальном времени!
              </p>

              <button
                onClick={() => setMode('create')}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-400 hover:to-emerald-500 transition-all transform hover:scale-105 shadow-lg"
              >
                🏠 Создать комнату
              </button>

              <button
                onClick={() => setMode('join')}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-400 hover:to-cyan-500 transition-all transform hover:scale-105 shadow-lg"
              >
                🔗 Присоединиться
              </button>
            </div>
          )}

          {/* Создание комнаты */}
          {mode === 'create' && (
            <div className="space-y-4">
              {status === 'idle' && (
                <button
                  onClick={onCreateRoom}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-400 hover:to-emerald-500 transition-all"
                >
                  Создать комнату
                </button>
              )}

              {status === 'connecting' && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-300">Подключение...</p>
                </div>
              )}

              {status === 'waiting' && (
                <div className="text-center">
                  <p className="text-gray-300 mb-4">Поделитесь кодом с другом:</p>
                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <p className="text-3xl font-mono font-bold text-cyan-400 tracking-wider">
                      {roomCode}
                    </p>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all"
                  >
                    📋 Копировать код
                  </button>
                  <div className="mt-6">
                    <div className="animate-pulse text-gray-400">
                      ⏳ Ожидание игрока...
                    </div>
                  </div>
                </div>
              )}

              {status === 'connected' && (
                <div className="text-center">
                  <div className="text-green-400 text-2xl mb-4">✅ Игрок подключился!</div>
                  <p className="text-gray-300 mb-4">Можете начинать игру</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-400 hover:to-emerald-500 transition-all"
                  >
                    Начать игру
                  </button>
                </div>
              )}

              {(status === 'idle' || status === 'waiting') && (
                <button
                  onClick={() => setMode('select')}
                  className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
                >
                  ← Назад
                </button>
              )}
            </div>
          )}

          {/* Присоединение к комнате */}
          {mode === 'join' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-center mb-4">Введите код комнаты:</p>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="TETRIS-XXXXX"
                className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white text-center text-xl font-mono tracking-wider focus:outline-none focus:border-purple-500"
                maxLength={12}
              />
              <button
                onClick={handleJoin}
                disabled={!joinCode.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-400 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Присоединиться
              </button>
              <button
                onClick={() => setMode('select')}
                className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
              >
                ← Назад
              </button>
            </div>
          )}

          {/* Ошибка */}
          {status === 'error' && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">❌ {errorMessage}</p>
              <button
                onClick={() => {
                  setMode('select');
                  onDisconnect();
                }}
                className="mt-2 text-red-300 hover:text-red-200 text-sm underline"
              >
                Попробовать снова
              </button>
            </div>
          )}

          {/* Отключение */}
          {status === 'connected' && mode !== 'create' && (
            <button
              onClick={onDisconnect}
              className="w-full mt-4 px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-500 transition-all"
            >
              Отключиться
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiplayerMenu;
