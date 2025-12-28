import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/interfaces/auth.interface';

interface AuthenticatedSocket extends Socket {
  user?: {
    sub: string;
    email: string;
    role: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients: Map<string, AuthenticatedSocket> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractTokenFromSocket(client);

      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      client.user = {
        sub: payload.sub,
        email: payload.email,
        role: String(payload.role),
      };

      this.connectedClients.set(client.id, client);
      await client.join(`user:${payload.sub}`);

      this.logger.log(
        `Cliente conectado: ${client.id} (Usuário: ${payload.email})`,
      );

      client.emit('connected', {
        message: 'Conectado com sucesso ao WebSocket',
        userId: payload.sub,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.warn(
        `Cliente ${client.id} desconectado: Token inválido - ${errorMessage}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  private extractTokenFromSocket(client: Socket): string | null {
    const authHeader = client.handshake.auth?.token as string | undefined;
    if (authHeader) {
      return authHeader;
    }

    const queryToken = client.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken;
    }

    return null;
  }

  @SubscribeMessage('ping')
  handlePing() {
    return { event: 'pong', data: { timestamp: new Date().toISOString() } };
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channel: string },
  ) {
    if (!data.channel) {
      return { event: 'error', data: { message: 'Canal é obrigatório' } };
    }

    await client.join(data.channel);
    this.logger.log(`Cliente ${client.id} inscrito no canal: ${data.channel}`);

    return {
      event: 'subscribed',
      data: {
        channel: data.channel,
        message: `Inscrito no canal ${data.channel}`,
      },
    };
  }

  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channel: string },
  ) {
    if (!data.channel) {
      return { event: 'error', data: { message: 'Canal é obrigatório' } };
    }

    await client.leave(data.channel);
    this.logger.log(
      `Cliente ${client.id} cancelou a inscrição do canal: ${data.channel}`,
    );

    return {
      event: 'unsubscribed',
      data: {
        channel: data.channel,
        message: `Cancelado a inscrição de ${data.channel}`,
      },
    };
  }

  emitToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToChannel(channel: string, event: string, data: unknown) {
    this.server.to(channel).emit(event, data);
  }

  emitToAll(event: string, data: unknown) {
    this.server.emit(event, data);
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}
