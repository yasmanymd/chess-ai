import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { createDatabase } from '../database/database.js';
import { resumeTemporaryIdentity } from '../../temporary-identity/application/resume-temporary-identity.js';
import { readTemporarySessionCookie } from '../../temporary-identity/delivery/session-cookie.js';

const connectionString = process.env.DATABASE_URL;
const database = connectionString ? createDatabase(connectionString) : undefined;

/** Non-authoritative notification channel. HTTP remains the source of all state. */
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class BootstrapGateway {
  @WebSocketServer()
  private server!: Server;

  async handleConnection(client: Socket): Promise<void> {
    if (!database) {
      client.disconnect(true);
      return;
    }
    const identity = await resumeTemporaryIdentity(
      database,
      readTemporarySessionCookie(client.handshake.headers.cookie),
    );
    if (!identity) {
      client.disconnect(true);
      return;
    }
    await client.join(`identity:${identity.id}`);
  }

  lobbyChanged(): void { this.server.emit('lobby.changed'); }
  gameStarted(identityIds: string[], gameId: string): void {
    for (const identityId of identityIds) this.server.to(`identity:${identityId}`).emit('game.started', { gameId });
  }
}
