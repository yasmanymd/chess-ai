import { WebSocketGateway } from '@nestjs/websockets';

/**
 * Keeps the Socket.IO transport available before product-specific gateways exist.
 * No gameplay events are handled at the bootstrap stage.
 */
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class BootstrapGateway {}
