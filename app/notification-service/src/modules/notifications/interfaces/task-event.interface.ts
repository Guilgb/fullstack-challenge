export interface TaskEvent {
  eventType:
    | 'task.created'
    | 'task.updated'
    | 'task.assigned'
    | 'task.status_changed'
    | 'task.comment';
  taskId: string;
  taskTitle: string;
  userId: string;
  assignedTo?: string;
  previousStatus?: string;
  newStatus?: string;
  commentAuthor?: string;
  commentText?: string;
  participants?: string[];
  timestamp: Date;
}
