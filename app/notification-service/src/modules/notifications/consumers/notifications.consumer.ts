import { Controller, Inject, Logger, forwardRef } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { NotificationsGateway } from '../gateways/notifications.gateway';
import type { TaskEvent } from '../interfaces/task-event.interface';
import { NotificationsService } from '../services/notifications.service';

interface RmqChannel {
  ack(message: unknown): void;
  nack(message: unknown, allUpTo?: boolean, requeue?: boolean): void;
}

@Controller()
export class NotificationsConsumer {
  private readonly logger = new Logger(NotificationsConsumer.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @EventPattern('task.created')
  async handleTaskCreated(
    @Payload() event: TaskEvent,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Recebido evento task.created: ${event.taskId}`);
    await this.processEvent({ ...event, eventType: 'task.created' }, context);
  }

  @EventPattern('task.updated')
  async handleTaskUpdated(
    @Payload() event: TaskEvent,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Recebido evento task.updated: ${event.taskId}`);
    await this.processEvent({ ...event, eventType: 'task.updated' }, context);
  }

  @EventPattern('task.assigned')
  async handleTaskAssigned(
    @Payload() event: TaskEvent,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Recebido evento task.assigned: ${event.taskId}`);
    await this.processEvent({ ...event, eventType: 'task.assigned' }, context);
  }

  @EventPattern('task.status_changed')
  async handleTaskStatusChanged(
    @Payload() event: TaskEvent,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Recebido evento task.status_changed: ${event.taskId}`);
    await this.processEvent(
      { ...event, eventType: 'task.status_changed' },
      context,
    );
  }

  @EventPattern('task.comment')
  async handleTaskComment(
    @Payload() event: TaskEvent,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Recebido evento task.comment: ${event.taskId}`);
    await this.processEvent({ ...event, eventType: 'task.comment' }, context);
  }

  private async processEvent(event: TaskEvent, context: RmqContext) {
    const channel = context.getChannelRef() as RmqChannel;
    const originalMsg = context.getMessage();

    try {
      // Cria notificações no banco
      const notifications =
        await this.notificationsService.createFromTaskEvent(event);

      // Envia via WebSocket para cada usuário
      for (const notification of notifications) {
        this.notificationsGateway.sendToUser(notification.userId, notification);
      }

      // Confirma mensagem processada
      channel.ack(originalMsg);
      this.logger.log(`Evento ${event.eventType} processado com sucesso`);
    } catch (error) {
      this.logger.error(`Erro ao processar evento ${event.eventType}:`, error);
      // Rejeita mensagem para reprocessamento
      channel.nack(originalMsg, false, true);
    }
  }
}
