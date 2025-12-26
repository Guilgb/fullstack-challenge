import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

export interface TaskEventPayload {
  taskId: string;
  taskTitle: string;
  userId: string;
  assignedTo?: string;
  previousStatus?: string;
  newStatus?: string;
  commentAuthor?: string;
  commentText?: string;
  participants?: string[];
  timestamp?: Date;
}

@Injectable()
export class EventsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventsService.name);
  private client: ClientProxy;

  async onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'notifications_queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    try {
      await this.client.connect();
      this.logger.log('📡 Conectado ao RabbitMQ para publicação de eventos');
    } catch (error) {
      this.logger.error('❌ Falha ao conectar ao RabbitMQ:', error);
    }
  }

  async onModuleDestroy() {
    await this.client?.close();
  }

  /**
   * Publica evento de tarefa criada
   */
  async publishTaskCreated(payload: TaskEventPayload): Promise<void> {
    await this.publish('task.created', payload);
  }

  /**
   * Publica evento de tarefa atualizada
   */
  async publishTaskUpdated(payload: TaskEventPayload): Promise<void> {
    await this.publish('task.updated', payload);
  }

  /**
   * Publica evento de tarefa atribuída
   */
  async publishTaskAssigned(payload: TaskEventPayload): Promise<void> {
    await this.publish('task.assigned', payload);
  }

  /**
   * Publica evento de mudança de status
   */
  async publishTaskStatusChanged(payload: TaskEventPayload): Promise<void> {
    await this.publish('task.status_changed', payload);
  }

  /**
   * Publica evento de novo comentário
   */
  async publishTaskComment(payload: TaskEventPayload): Promise<void> {
    await this.publish('task.comment', payload);
  }

  private async publish(
    pattern: string,
    payload: TaskEventPayload,
  ): Promise<void> {
    try {
      const eventPayload = {
        ...payload,
        timestamp: payload.timestamp || new Date(),
      };

      this.client.emit(pattern, eventPayload);
      this.logger.log(
        `📤 Evento ${pattern} publicado para task ${payload.taskId}`,
      );
    } catch (error) {
      this.logger.error(`❌ Erro ao publicar evento ${pattern}:`, error);
    }
  }
}
