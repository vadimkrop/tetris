import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useState, useEffect, useRef, useCallback } from 'react';

// Инициализация Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.warn('Supabase не настроен. Мультиплеер будет недоступен.');
} else {
  console.log('✅ Supabase настроен:', supabaseUrl);
}

export type PlayerState = {
  score: number;
  lines: number;
  level: number;
  board: number[][];
  isAlive: boolean;
  nextPiece: string;
};

export type MultiplayerStatus = 'idle' | 'connecting' | 'waiting' | 'connected' | 'disconnected' | 'error' | 'not_configured';

const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TETRIS-';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export const useMultiplayer = () => {
  const [status, setStatus] = useState<MultiplayerStatus>(
    isSupabaseConfigured ? 'idle' : 'not_configured'
  );
  const [roomCode, setRoomCode] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [opponentState, setOpponentState] = useState<PlayerState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const roomIdRef = useRef<string | null>(null);
  const playerIdRef = useRef<string | null>(null);
  const playerNumberRef = useRef<number | null>(null);
  const channelRef = useRef<any>(null);

  // Подписка на изменения в комнате
  const subscribeToRoom = useCallback((roomId: string, myPlayerNumber: number) => {
    if (!supabase) return;
    
    const opponentNumber = myPlayerNumber === 1 ? 2 : 1;
    console.log(`📡 Подписка на комнату ${roomId}, мой номер: ${myPlayerNumber}, ищу игрока ${opponentNumber}`);

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: any) => {
          console.log('📨 Получено обновление:', payload);
          const updatedPlayer = payload.new;
          
          if (updatedPlayer && updatedPlayer.player_number === opponentNumber) {
            console.log('✅ Обновление от противника:', updatedPlayer);
            setOpponentState({
              score: updatedPlayer.score || 0,
              lines: updatedPlayer.lines || 0,
              level: updatedPlayer.level || 1,
              board: updatedPlayer.board_state || Array(20).fill(null).map(() => Array(10).fill(0)),
              isAlive: updatedPlayer.is_alive !== false,
              nextPiece: updatedPlayer.next_piece || 'T',
            });
          }
        }
      )
      .subscribe((status: string) => {
        console.log('📡 Статус подписки:', status);
      });

    channelRef.current = channel;
  }, []);

  // Создать комнату (хост)
  const createRoom = useCallback(async () => {
    if (!supabase) {
      setErrorMessage('Supabase не настроен');
      setStatus('error');
      return;
    }

    try {
      setStatus('connecting');
      const code = generateRoomCode();
      setRoomCode(code);
      setIsHost(true);
      
      console.log('🏠 Создаю комнату с кодом:', code);

      // Создаём комнату в БД
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .insert({ code: code, status: 'waiting' })
        .select()
        .single();

      if (roomError) {
        console.error('❌ Ошибка создания комнаты:', roomError);
        throw roomError;
      }

      console.log('✅ Комната создана:', room);
      roomIdRef.current = room.id;

      // Создаём игрока 1
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          player_number: 1,
          score: 0,
          lines: 0,
          level: 1,
          board_state: Array(20).fill(null).map(() => Array(10).fill(0)),
          is_alive: true,
          next_piece: 'T',
        })
        .select()
        .single();

      if (playerError) {
        console.error('❌ Ошибка создания игрока:', playerError);
        throw playerError;
      }

      console.log('✅ Игрок создан:', player);
      playerIdRef.current = player.id;
      playerNumberRef.current = 1;

      // Подписываемся на изменения
      subscribeToRoom(room.id, 1);
      setStatus('waiting');
    } catch (err: any) {
      console.error('❌ Create room error:', err);
      setErrorMessage(err.message || 'Ошибка создания комнаты');
      setStatus('error');
    }
  }, [subscribeToRoom]);

  // Присоединиться к комнате
  const joinRoom = useCallback(async (inputCode: string) => {
    if (!supabase) {
      setErrorMessage('Supabase не настроен');
      setStatus('error');
      return;
    }

    try {
      setStatus('connecting');
      const code = inputCode.trim().toUpperCase();
      setRoomCode(code);
      setIsHost(false);
      
      console.log('🔗 Ищу комнату с кодом:', code);

      // Сначала проверим все комнаты с таким кодом (без фильтра по статусу)
      const { data: allRooms, error: allRoomsError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('code', code);

      console.log('📋 Все комнаты с таким кодом:', allRooms, 'Ошибка:', allRoomsError);

      if (allRoomsError) {
        console.error('❌ Ошибка поиска комнат:', allRoomsError);
        throw allRoomsError;
      }

      if (!allRooms || allRooms.length === 0) {
        throw new Error('Комната не найдена. Проверьте код.');
      }

      // Ищем комнату со статусом waiting или playing
      const room = allRooms.find(r => r.status === 'waiting' || r.status === 'playing');
      
      if (!room) {
        throw new Error('Комната уже завершена или недоступна');
      }

      console.log('✅ Найдена комната:', room);

      // Проверяем сколько уже игроков
      const { data: existingPlayers, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', room.id);

      console.log('👥 Игроки в комнате:', existingPlayers);

      if (playersError) {
        console.error('❌ Ошибка получения игроков:', playersError);
        throw playersError;
      }

      if (existingPlayers && existingPlayers.length >= 2) {
        throw new Error('Комната уже заполнена (2 игрока)');
      }

      roomIdRef.current = room.id;

      // Создаём игрока 2
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          player_number: 2,
          score: 0,
          lines: 0,
          level: 1,
          board_state: Array(20).fill(null).map(() => Array(10).fill(0)),
          is_alive: true,
          next_piece: 'T',
        })
        .select()
        .single();

      if (playerError) {
        console.error('❌ Ошибка подключения игрока:', playerError);
        throw playerError;
      }

      console.log('✅ Игрок подключён:', player);
      playerIdRef.current = player.id;
      playerNumberRef.current = 2;

      // Обновляем статус комнаты на playing
      await supabase
        .from('game_rooms')
        .update({ status: 'playing' })
        .eq('id', room.id);

      // Подписываемся на изменения
      subscribeToRoom(room.id, 2);
      setStatus('connected');
    } catch (err: any) {
      console.error('❌ Join room error:', err);
      setErrorMessage(err.message || 'Ошибка подключения к комнате');
      setStatus('error');
    }
  }, [subscribeToRoom]);

  // Отправить своё состояние
  const sendState = useCallback(async (state: PlayerState) => {
    if (!supabase || !playerIdRef.current) return;

    try {
      await supabase
        .from('players')
        .update({
          score: state.score,
          lines: state.lines,
          level: state.level,
          board_state: state.board,
          is_alive: state.isAlive,
          next_piece: state.nextPiece,
          last_update: new Date().toISOString(),
        })
        .eq('id', playerIdRef.current);
    } catch (err) {
      console.error('Send state error:', err);
    }
  }, []);

  // Отправить game over
  const sendGameOver = useCallback(async () => {
    if (!supabase || !playerIdRef.current) return;

    try {
      await supabase
        .from('players')
        .update({
          is_alive: false,
          last_update: new Date().toISOString(),
        })
        .eq('id', playerIdRef.current);

      if (roomIdRef.current) {
        await supabase
          .from('game_rooms')
          .update({ status: 'finished' })
          .eq('id', roomIdRef.current);
      }
    } catch (err) {
      console.error('Send game over error:', err);
    }
  }, []);

  // Закрыть соединение
  const disconnect = useCallback(async () => {
    if (channelRef.current && supabase) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (playerIdRef.current && supabase) {
      await supabase
        .from('players')
        .delete()
        .eq('id', playerIdRef.current);
    }

    if (isHost && roomIdRef.current && supabase) {
      const { data: room } = await supabase
        .from('game_rooms')
        .select()
        .eq('id', roomIdRef.current)
        .single();

      if (room && room.status === 'waiting') {
        await supabase
          .from('game_rooms')
          .delete()
          .eq('id', roomIdRef.current);
      }
    }

    setStatus(isSupabaseConfigured ? 'idle' : 'not_configured');
    setRoomCode('');
    setOpponentState(null);
    setErrorMessage('');
    roomIdRef.current = null;
    playerIdRef.current = null;
    playerNumberRef.current = null;
  }, [isHost]);

  // Очистка при unmount
  useEffect(() => {
    return () => {
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return {
    status,
    roomCode,
    isHost,
    opponentState,
    errorMessage,
    createRoom,
    joinRoom,
    sendState,
    sendGameOver,
    disconnect,
  };
};
