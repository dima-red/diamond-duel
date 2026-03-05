export type CellState = 'hidden' | 'revealed';

export interface Cell {
  x: number;
  y: number;
  hasDiamond: boolean;
  adjacentDiamonds: number;
  state: CellState;
}

export type GameStatus = 'waiting_for_players' | 'in_progress' | 'finished';

export interface Player {
  id: string;
  score: number;
  name?: string;
}

export interface Game {
  id: string;
  size: number;
  diamondsCount: number;
  cells: Cell[];
  players: Player[];
  currentPlayerId?: string;
  status: GameStatus;
}

