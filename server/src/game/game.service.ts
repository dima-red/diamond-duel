import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Cell, Game } from './game.types';
import { CreateGameDto } from './dto/create-game.dto';

@Injectable()
export class GameService {
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

