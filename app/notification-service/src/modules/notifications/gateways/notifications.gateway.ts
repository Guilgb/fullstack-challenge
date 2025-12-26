import { Logger } from '@nestjs/common';
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
import { NotificationEntity } from '../../../shared/database/entities/notification.entity';
import { NotificationsService } from '../services/notifications.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private readonly notificationsService: NotificationsService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway inicializado');
  }

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);

    if (client.userId) {
      const userSocketSet = this.userSockets.get(client.userId);
      if (userSocketSet) {
        userSocketSet.delete(client.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(client.userId);
        }
      }
    }
  }

  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string },
  ) {
    if (!data.userId) {
      client.emit('error', { message: 'userId é obrigatório' });
      return;
    }

    client.userId = data.userId;

    if (!this.userSockets.has(data.userId)) {
      this.userSockets.set(data.userId, new Set());
    }
    this.userSockets.get(data.userId)?.add(client.id);

    await client.join(`user:${data.userId}`);

    this.logger.log(
      `Usuário ${data.userId} autenticado no socket ${client.id}`,
    );

    client.emit('authenticated', { success: true });

    void this.sendUnreadCount(data.userId);
  }

  @SubscribeMessage('get_notifications')
  async handleGetNotifications(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { unreadOnly?: boolean; limit?: number },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Não autenticado' });
      return;
    }

    const notifications = await this.notificationsService.findByUserId(
      client.userId,
      data,
    );

    client.emit('notifications', notifications);
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Não autenticado' });
      return;
    }

    await this.notificationsService.markAsRead(
      data.notificationId,
      client.userId,
    );

    client.emit('notification_read', { notificationId: data.notificationId });

    void this.sendUnreadCount(client.userId);
  }

  @SubscribeMessage('mark_all_as_read')
  async handleMarkAllAsRead(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      client.emit('error', { message: 'Não autenticado' });
      return;
    }

    await this.notificationsService.markAllAsRead(client.userId);

    client.emit('all_notifications_read', { success: true });

    void this.sendUnreadCount(client.userId);
  }

  sendToUser(userId: string, notification: NotificationEntity) {
    this.server.to(`user:${userId}`).emit('new_notification', notification);

    void this.sendUnreadCount(userId);

    this.logger.log(`Notificação enviada para usuário ${userId}`);
  }

  private async sendUnreadCount(userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    this.server.to(`user:${userId}`).emit('unread_count', { count });
  }
}
