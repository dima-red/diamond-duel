export type CellState = 'hidden' | 'revealed';

export interface Cell {
  x: number;
  y: number;
  hasDiamond: boolean;
  adjacentDiamonds: number;
  state: CellState;
  ownerPlayerId?: string;
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

export type CellPublicType = 'diamond' | 'number';

export interface PublicCell {
  x: number;
  y: number;
  state: CellState;
  type?: CellPublicType;
  adjacentDiamonds?: number;
  ownerPlayerId?: string;
}

export interface PublicGameState {
  id: string;
  size: number;
  diamondsCount: number;
  status: GameStatus;
  currentPlayerId?: string;
  players: Player[];
  cells: PublicCell[];
}

