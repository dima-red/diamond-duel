import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

interface JoinGamePayload {
  gameId: string;
  nickname?: string;
}

interface RevealCellPayload {
  gameId: string;
  x: number;
  y: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(GameGateway.name);

  constructor(private readonly gameService: GameService) {}

  // TODO: In production we have to handle disconnects, reconnections and player timeouts here

  @SubscribeMessage('join_game')
  handleJoinGame(
    @MessageBody() payload: JoinGamePayload,
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      const game = this.gameService.joinGame(payload.gameId, client.id, payload.nickname);

      client.join(game.id);

      const publicState = this.gameService.serializeForClient(game);

      this.server.to(game.id).emit('game_state', publicState);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join game';

      this.logger.warn(`join_game failed: ${message}`);

      client.emit('error', {
        message,
        code: 'join_failed',
      });
    }
  }

  @SubscribeMessage('reveal_cell')
  handleRevealCell(
    @MessageBody() payload: RevealCellPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      const game = this.gameService.revealCell(
        payload.gameId,
        client.id,
        payload.x,
        payload.y,
      );

      const publicState = this.gameService.serializeForClient(game);

      this.server.to(game.id).emit('game_state', publicState);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reveal cell';

      this.logger.warn(`reveal_cell failed: ${message}`);

      client.emit('error', {
        message,
        code: 'invalid_move',
      });
    }
  }
}

