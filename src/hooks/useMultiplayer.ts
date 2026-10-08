import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';

export type PlayerState = {
  score: number;
  lines: number;
  level: number;
  board: number[][]; // 0 = пусто, 1 = заполнено
  isAlive: boolean;
  nextPiece: string;
};

export type MultiplayerMessage = {
  type: 'state' | 'gameover' | 'ready' | 'start';
  payload?: PlayerState | string;
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

  const peerRef = useRef<Peer | null>(null);
  const connectionRef = useRef<DataConnection | null>(null);
  const myStateRef = useRef<PlayerState>({
    score: 0,
    lines: 0,
    level: 1,
    board: Array(20).fill(null).map(() => Array(10).fill(0)),
    isAlive: true,
    nextPiece: 'T',
  });

  // Инициализация Peer
  const initPeer = useCallback((peerId: string): Promise<Peer> => {
    return new Promise((resolve, reject) => {
      const peer = new Peer(peerId, {
        debug: 1,
      });

      peer.on('open', (id) => {
        console.log('My peer ID:', id);
        resolve(peer);
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        setErrorMessage(err.message);
        setStatus('error');
        reject(err);
      });

      peer.on('disconnected', () => {
        console.log('Peer disconnected');
        setStatus('disconnected');
      });

      peerRef.current = peer;
    });
  }, []);

  // Обработка входящих сообщений
  const handleMessage = useCallback((data: MultiplayerMessage) => {
    console.log('Received message:', data);
    
    switch (data.type) {
      case 'state':
        if (data.payload) {
          setOpponentState(data.payload as PlayerState);
        }
        break;
      case 'gameover':
        console.log('Opponent game over');
        break;
      case 'ready':
        console.log('Opponent ready');
        break;
      case 'start':
        console.log('Game started');
        break;
    }
  }, []);

  // Создать комнату (хост)
  const createRoom = useCallback(async () => {
    try {
      setStatus('connecting');
      const code = generateRoomCode();
      setRoomCode(code);
      setIsHost(true);

      const peer = await initPeer(code);

      peer.on('connection', (conn) => {
        console.log('Opponent connected');
        connectionRef.current = conn;

        conn.on('open', () => {
          console.log('Connection opened');
          setStatus('connected');
        });

        conn.on('data', (data) => {
          handleMessage(data as MultiplayerMessage);
        });

        conn.on('close', () => {
          console.log('Connection closed');
          setStatus('disconnected');
          connectionRef.current = null;
        });

        conn.on('error', (err) => {
          console.error('Connection error:', err);
          setErrorMessage(err.message);
        });
      });

      setStatus('waiting');
    } catch (err) {
      console.error('Create room error:', err);
      setStatus('error');
    }
  }, [initPeer, handleMessage]);

  // Присоединиться к комнате
  const joinRoom = useCallback(async (code: string) => {
    try {
      setStatus('connecting');
      setRoomCode(code);
      setIsHost(false);

      const myId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const peer = await initPeer(myId);

      const conn = peer.connect(code, {
        reliable: true,
      });

      connectionRef.current = conn;

      conn.on('open', () => {
        console.log('Connected to host');
        setStatus('connected');
        
        // Отправить ready
        conn.send({ type: 'ready' } as MultiplayerMessage);
      });

      conn.on('data', (data) => {
        handleMessage(data as MultiplayerMessage);
      });

      conn.on('close', () => {
        console.log('Connection closed');
        setStatus('disconnected');
        connectionRef.current = null;
      });

      conn.on('error', (err) => {
        console.error('Connection error:', err);
        setErrorMessage(err.message);
        setStatus('error');
      });
    } catch (err) {
      console.error('Join room error:', err);
      setStatus('error');
    }
  }, [initPeer, handleMessage]);

  // Отправить своё состояние
  const sendState = useCallback((state: PlayerState) => {
    myStateRef.current = state;
    
    if (connectionRef.current && connectionRef.current.open) {
      connectionRef.current.send({
        type: 'state',
        payload: state,
      } as MultiplayerMessage);
    }
  }, []);

  // Отправить game over
  const sendGameOver = useCallback(() => {
    if (connectionRef.current && connectionRef.current.open) {
      connectionRef.current.send({
        type: 'gameover',
      } as MultiplayerMessage);
    }
  }, []);

  // Закрыть соединение
  const disconnect = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setStatus('idle');
    setRoomCode('');
    setOpponentState(null);
    setErrorMessage('');
  }, []);

  // Очистка при unmount
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.close();
      }
      if (peerRef.current) {
        peerRef.current.destroy();
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
