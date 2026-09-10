--- src/types.ts (原始)


+++ src/types.ts (修改后)
import { TetrominoType } from './constants';

export type Cell = {
  filled: boolean;
  color: string;
};

export type Board = Cell[][];

export type Piece = {
  type: TetrominoType;
  shape: number[][];
  color: string;
  x: number;
  y: number;
};

export type GameState = 'idle' | 'playing' | 'paused' | 'gameover';
