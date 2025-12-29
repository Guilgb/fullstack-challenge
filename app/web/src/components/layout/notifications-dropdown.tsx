import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { formatDateTime } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  ClipboardList,
  RefreshCw,
  UserPlus,
} from "lucide-react";

const notificationIcons: Record<string, React.ReactNode> = {
  TASK_ASSIGNED: <UserPlus className="h-4 w-4 text-blue-500" />,
  TASK_STATUS_CHANGED: <RefreshCw className="h-4 w-4 text-orange-500" />,
  TASK_CREATED: <ClipboardList className="h-4 w-4 text-green-500" />,
  TASK_COMMENT: <ClipboardList className="h-4 w-4 text-purple-500" />,
  TASK_UPDATED: <RefreshCw className="h-4 w-4 text-yellow-500" />,
};

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

function NotificationItem({ notification, onRead }: NotificationItemProps) {
  return (
    <div
      className={`p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors ${
        !notification.read ? "bg-primary/5" : ""
      }`}
      onClick={() => !notification.read && onRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {notificationIcons[notification.type] || (
            <Bell className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium truncate">{notification.title}</p>
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDateTime(notification.createdAt)}
          </p>
          {notification.taskId && (
            <Link
              to="/tasks/$taskId"
              params={{ taskId: notification.taskId }}
              className="text-xs text-primary hover:underline mt-1 inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              Ver tarefa
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationsDropdown() {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Notificações</span>
            {isConnected ? (
              <span
                className="h-2 w-2 rounded-full bg-green-500"
                title="Conectado"
              />
            ) : (
              <span
                className="h-2 w-2 rounded-full bg-red-500"
                title="Desconectado"
              />
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={refreshNotifications}
              title="Atualizar"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={markAllAsRead}
                title="Marcar todas como lidas"
              >
                <CheckCheck className="h-3 w-3" />
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
              />
            ))
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm text-muted-foreground">
              {notifications.length} notificação(ões)
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
