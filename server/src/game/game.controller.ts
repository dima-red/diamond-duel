import { Body, Controller, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  createGame(@Body() dto: CreateGameDto) {
    const game = this.gameService.createGame(dto);

    return {
      id: game.id,
      size: game.size,
      diamondsCount: game.diamondsCount,
    };
  }
}

