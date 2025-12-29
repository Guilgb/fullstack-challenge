import { taskKeys } from "@/hooks/use-tasks";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

const NOTIFICATION_WS_URL =
  import.meta.env.VITE_NOTIFICATION_WS_URL || "http://localhost:3002";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  taskId?: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export function useNotifications() {
  const socketRef = useRef<Socket | null>(null);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const handleNewNotification = useCallback(
    (notification: Notification) => {
      console.log("Nova notificação recebida:", notification);

      setNotifications((prev) => [notification, ...prev]);

      switch (notification.type) {
        case "TASK_ASSIGNED":
          toast({
            title: notification.title,
            description: notification.message,
            variant: "default",
          });
          queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
          break;
        case "TASK_STATUS_CHANGED":
          toast({
            title: notification.title,
            description: notification.message,
            variant: "default",
          });
          queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
          break;
        case "TASK_CREATED":
          toast({
            title: notification.title,
            description: notification.message,
            variant: "success",
          });
          queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
          break;
        case "TASK_COMMENT":
          toast({
            title: notification.title,
            description: notification.message,
          });
          break;
        default:
          toast({
            title: notification.title,
            description: notification.message,
          });
      }
    },
    [queryClient]
  );

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(`${NOTIFICATION_WS_URL}/notifications`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Notification WebSocket connected");
      socket.emit("authenticate", { userId: user.id });
    });

    socket.on("authenticated", (data: { success: boolean }) => {
      console.log("Notification WebSocket authenticated:", data);
      setIsConnected(true);

      socket.emit("get_notifications", { limit: 20 });
    });

    socket.on("notifications", (data: Notification[]) => {
      console.log("Notificações carregadas:", data.length);
      setNotifications(data);
    });

    socket.on("new_notification", handleNewNotification);

    socket.on("unread_count", (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    socket.on("notification_read", (data: { notificationId: string }) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === data.notificationId ? { ...n, read: true } : n
        )
      );
    });

    socket.on("all_notifications_read", () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    });

    socket.on("error", (error: { message: string }) => {
      console.error("Notification WebSocket error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Notification WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Notification WebSocket connection error:", error);
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, user?.id, handleNewNotification]);

  const markAsRead = useCallback((notificationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("mark_as_read", { notificationId });
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("mark_all_as_read");
    }
  }, []);

  const refreshNotifications = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("get_notifications", { limit: 20 });
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
}
