import { createClient } from '@supabase/supabase-js';
import { useState, useEffect, useRef, useCallback } from 'react';

// Инициализация Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PlayerState = {
  score: number;
  lines: number;
  level: number;
  board: number[][];
  isAlive: boolean;
  nextPiece: string;
};

export type MultiplayerStatus = 'idle' | 'connecting' | 'waiting' | 'connected' | 'disconnected' | 'error';

const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TETRIS-';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export const useMultiplayer = () => {
  const [status, setStatus] = useState<MultiplayerStatus>('idle');
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
    const opponentNumber = myPlayerNumber === 1 ? 2 : 1;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const updatedPlayer = payload.new;
          
          // Обновляем только если это противник
          if (updatedPlayer.player_number === opponentNumber) {
            setOpponentState({
              score: updatedPlayer.score,
              lines: updatedPlayer.lines,
              level: updatedPlayer.level,
              board: updatedPlayer.board_state,
              isAlive: updatedPlayer.is_alive,
              nextPiece: updatedPlayer.next_piece,
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  }, []);

  // Создать комнату (хост)
  const createRoom = useCallback(async () => {
    try {
      setStatus('connecting');
      const code = generateRoomCode();
      setRoomCode(code);
      setIsHost(true);

      // Создаём комнату в БД
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .insert({ code, status: 'waiting' })
        .select()
        .single();

      if (roomError) throw roomError;

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

      if (playerError) throw playerError;

      playerIdRef.current = player.id;
      playerNumberRef.current = 1;

      // Подписываемся на изменения
      subscribeToRoom(room.id, 1);

      setStatus('waiting');
    } catch (err: any) {
      console.error('Create room error:', err);
      setErrorMessage(err.message || 'Ошибка создания комнаты');
      setStatus('error');
    }
  }, [subscribeToRoom]);

  // Присоединиться к комнате
  const joinRoom = useCallback(async (code: string) => {
    try {
      setStatus('connecting');
      setRoomCode(code);
      setIsHost(false);

      // Ищем комнату
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select()
        .eq('code', code)
        .eq('status', 'waiting')
        .single();

      if (roomError || !room) {
        throw new Error('Комната не найдена или уже занята');
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

      if (playerError) throw playerError;

      playerIdRef.current = player.id;
      playerNumberRef.current = 2;

      // Обновляем статус комнаты
      await supabase
        .from('game_rooms')
        .update({ status: 'playing' })
        .eq('id', room.id);

      // Подписываемся на изменения
      subscribeToRoom(room.id, 2);

      setStatus('connected');
    } catch (err: any) {
      console.error('Join room error:', err);
      setErrorMessage(err.message || 'Ошибка подключения к комнате');
      setStatus('error');
    }
  }, [subscribeToRoom]);

  // Отправить своё состояние
  const sendState = useCallback(async (state: PlayerState) => {
    if (!playerIdRef.current) return;

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
    if (!playerIdRef.current) return;

    try {
      await supabase
        .from('players')
        .update({
          is_alive: false,
          last_update: new Date().toISOString(),
        })
        .eq('id', playerIdRef.current);

      // Обновляем статус комнаты
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
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Удаляем игрока из БД
    if (playerIdRef.current) {
      await supabase
        .from('players')
        .delete()
        .eq('id', playerIdRef.current);
    }

    // Если хост и комната в статусе waiting, удаляем комнату
    if (isHost && roomIdRef.current) {
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

    setStatus('idle');
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
      if (channelRef.current) {
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
