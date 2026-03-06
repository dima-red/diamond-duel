import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Cell, Game, PublicCell, PublicGameState } from './game.types';
import { CreateGameDto } from './dto/create-game.dto';

@Injectable()
export class GameService {
  private static readonly REQUIRED_PLAYERS_PER_GAME = 2;

  private readonly games = new Map<string, Game>();

  createGame(dto: CreateGameDto): Game {
    const { size, diamondsCount } = dto;

    if (diamondsCount % 2 === 0) {
      throw new BadRequestException('Diamonds count must be an odd number');
    }

    if (diamondsCount > size * size) {
      throw new BadRequestException('Diamonds count cannot exceed total cells');
    }

    const id = randomUUID();
    const cells = this.createCells(size, diamondsCount);

    const game: Game = {
      id,
      size,
      diamondsCount,
      cells,
      players: [],
      status: 'waiting_for_players',
    };

    this.games.set(id, game);

    return game;
  }

  getGame(id: string): Game | undefined {
    return this.games.get(id);
  }

  joinGame(gameId: string, playerId: string, playerName?: string): Game {
    const game = this.getExistingGame(gameId);

    let player = game.players.find((candidate) => candidate.id === playerId);

    if (!player) {
      if (game.players.length >= GameService.REQUIRED_PLAYERS_PER_GAME) {
        throw new BadRequestException('Game already has required number of players');
      }

      player = { id: playerId, score: 0, name: playerName };
      game.players.push(player);
    }

    if (
      game.players.length === GameService.REQUIRED_PLAYERS_PER_GAME &&
      game.status === 'waiting_for_players'
    ) {
      game.status = 'in_progress';
      game.currentPlayerId = game.players[0]?.id;
    }

    return game;
  }

  revealCell(gameId: string, playerId: string, x: number, y: number): Game {
    const game = this.getExistingGame(gameId);

    this.ensureGameInProgress(game);
    this.ensurePlayerTurn(game, playerId);

    const cell = this.getHiddenCell(game, x, y);

    cell.state = 'revealed';
    cell.ownerPlayerId = playerId;

    const player = this.getExistingPlayer(game, playerId);

    if (cell.hasDiamond) {
      player.score += 1;
    } else {
      const otherPlayer = game.players.find((candidate) => candidate.id !== playerId);

      if (otherPlayer) {
        game.currentPlayerId = otherPlayer.id;
      }
    }

    this.updateGameStatusIfFinished(game);

    return game;
  }

  serializeForClient(game: Game): PublicGameState {
    return {
      id: game.id,
      size: game.size,
      diamondsCount: game.diamondsCount,
      status: game.status,
      currentPlayerId: game.currentPlayerId,
      players: game.players,
      cells: game.cells.map((cell) => this.serializeCell(cell)),
    };
  }

  private serializeCell(cell: Cell): PublicCell {
    const base = { x: cell.x, y: cell.y, state: cell.state };

    if (cell.state === 'hidden') {
      return base;
    }

    if (cell.hasDiamond) {
      return { ...base, type: 'diamond', ownerPlayerId: cell.ownerPlayerId };
    }

    return {
      ...base,
      type: 'number',
      adjacentDiamonds: cell.adjacentDiamonds,
      ownerPlayerId: cell.ownerPlayerId,
    };
  }

  private getExistingGame(gameId: string): Game {
    const game = this.games.get(gameId);

    if (!game) {
      throw new BadRequestException('Game not found');
    }

    return game;
  }

  private ensureGameInProgress(game: Game): void {
    if (game.status !== 'in_progress') {
      throw new BadRequestException('Game is not in progress');
    }
  }

  private ensurePlayerTurn(game: Game, playerId: string): void {
    if (game.currentPlayerId !== playerId) {
      throw new BadRequestException("It is not this player's turn");
    }
  }

  private getExistingPlayer(game: Game, playerId: string) {
    const player = game.players.find((candidate) => candidate.id === playerId);

    if (!player) {
      throw new BadRequestException('Player not found in this game');
    }

    return player;
  }

  private getHiddenCell(game: Game, x: number, y: number): Cell {
    const cell = game.cells.find((candidate) => candidate.x === x && candidate.y === y);

    if (!cell) {
      throw new BadRequestException('Cell not found');
    }

    if (cell.state === 'revealed') {
      throw new BadRequestException('Cell is already revealed');
    }

    return cell;
  }

  private updateGameStatusIfFinished(game: Game): void {
    const foundDiamonds = game.cells.filter(
      (candidate) => candidate.hasDiamond && candidate.state === 'revealed',
    ).length;

    if (foundDiamonds >= game.diamondsCount) {
      game.status = 'finished';
    }
  }

  private createCells(size: number, diamondsCount: number): Cell[] {
    const coordinates: Array<{ x: number; y: number }> = [];

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        coordinates.push({ x, y });
      }
    }

    const shuffled = [...coordinates].sort(() => Math.random() - 0.5);
    const diamondCoords = new Set(
      shuffled.slice(0, diamondsCount).map((coord) => `${coord.x},${coord.y}`),
    );

    const cells: Cell[] = coordinates.map(({ x, y }) => {
      const hasDiamond = diamondCoords.has(`${x},${y}`);

      return {
        x,
        y,
        hasDiamond,
        adjacentDiamonds: 0,
        state: 'hidden',
      };
    });

    const getCell = (x: number, y: number): Cell | undefined =>
      cells.find((cell) => cell.x === x && cell.y === y);

    for (const cell of cells) {
      if (cell.hasDiamond) {
        continue;
      }

      let count = 0;

      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) {
            continue;
          }

          const neighbor = getCell(cell.x + dx, cell.y + dy);

          if (neighbor?.hasDiamond) {
            count += 1;
          }
        }
      }

      cell.adjacentDiamonds = count;
    }

    return cells;
  }
}

