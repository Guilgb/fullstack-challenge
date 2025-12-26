import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationEntity,
  NotificationType,
} from '../../../shared/database/entities/notification.entity';
import { TaskEvent } from '../interfaces/task-event.interface';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async createFromTaskEvent(event: TaskEvent): Promise<NotificationEntity[]> {
    const notifications: NotificationEntity[] = [];

    switch (event.eventType) {
      case 'task.assigned':
        if (event.assignedTo) {
          const notification = this.notificationRepository.create({
            userId: event.assignedTo,
            type: NotificationType.TASK_ASSIGNED,
            title: 'Tarefa atribuída',
            message: `A tarefa "${event.taskTitle}" foi atribuída a você`,
            taskId: event.taskId,
            metadata: { assignedBy: event.userId },
          });
          notifications.push(
            await this.notificationRepository.save(notification),
          );
        }
        break;

      case 'task.status_changed':
        if (event.participants) {
          for (const participantId of event.participants) {
            const notification = this.notificationRepository.create({
              userId: participantId,
              type: NotificationType.TASK_STATUS_CHANGED,
              title: 'Status alterado',
              message: `A tarefa "${event.taskTitle}" mudou de "${event.previousStatus}" para "${event.newStatus}"`,
              taskId: event.taskId,
              metadata: {
                previousStatus: event.previousStatus,
                newStatus: event.newStatus,
                changedBy: event.userId,
              },
            });
            notifications.push(
              await this.notificationRepository.save(notification),
            );
          }
        }
        break;

      case 'task.comment':
        if (event.participants) {
          for (const participantId of event.participants) {
            if (participantId === event.commentAuthor) continue;

            const notification = this.notificationRepository.create({
              userId: participantId,
              type: NotificationType.TASK_COMMENT,
              title: 'Novo comentário',
              message: `Novo comentário na tarefa "${event.taskTitle}"`,
              taskId: event.taskId,
              metadata: {
                commentAuthor: event.commentAuthor,
                commentPreview: event.commentText?.substring(0, 100),
              },
            });
            notifications.push(
              await this.notificationRepository.save(notification),
            );
          }
        }
        break;

      case 'task.created':
        if (event.assignedTo && event.assignedTo !== event.userId) {
          const notification = this.notificationRepository.create({
            userId: event.assignedTo,
            type: NotificationType.TASK_CREATED,
            title: 'Nova tarefa',
            message: `Uma nova tarefa "${event.taskTitle}" foi criada e atribuída a você`,
            taskId: event.taskId,
            metadata: { createdBy: event.userId },
          });
          notifications.push(
            await this.notificationRepository.save(notification),
          );
        }
        break;

      case 'task.updated':
        if (event.participants) {
          for (const participantId of event.participants) {
            if (participantId === event.userId) continue;

            const notification = this.notificationRepository.create({
              userId: participantId,
              type: NotificationType.TASK_UPDATED,
              title: 'Tarefa atualizada',
              message: `A tarefa "${event.taskTitle}" foi atualizada`,
              taskId: event.taskId,
              metadata: { updatedBy: event.userId },
            });
            notifications.push(
              await this.notificationRepository.save(notification),
            );
          }
        }
        break;
    }

    this.logger.log(
      `Criadas ${notifications.length} notificações para evento ${event.eventType}`,
    );

    return notifications;
  }

  async findByUserId(
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number },
  ): Promise<NotificationEntity[]> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (options?.unreadOnly) {
      query.andWhere('notification.read = :read', { read: false });
    }

    if (options?.limit) {
      query.take(options.limit);
    }

    return query.getMany();
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, userId },
      { read: true },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, read: false },
      { read: true },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, read: false },
    });
  }
}
