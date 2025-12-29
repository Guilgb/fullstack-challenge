import { taskKeys } from "@/hooks/use-tasks";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_WS_URL || "http://localhost:4000";

interface WebSocketNotification {
  type: string;
  data: unknown;
  message?: string;
}

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();

  const handleNotification = useCallback(
    (notification: WebSocketNotification) => {
      console.log("WebSocket notification:", notification);

      switch (notification.type) {
        case "task_created":
          toast({
            title: "Nova tarefa",
            description: notification.message || "Uma nova tarefa foi criada.",
          });
          queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
          break;
        case "task_updated":
          toast({
            title: "Tarefa atualizada",
            description: notification.message || "Uma tarefa foi atualizada.",
          });
          queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
          queryClient.invalidateQueries({ queryKey: taskKeys.details() });
          break;
        case "task_deleted":
          toast({
            title: "Tarefa excluída",
            description: notification.message || "Uma tarefa foi excluída.",
          });
          queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
          break;
        case "comment_added":
          toast({
            title: "Novo comentário",
            description:
              notification.message || "Um novo comentário foi adicionado.",
          });
          break;
        default:
          if (notification.message) {
            toast({
              title: "Notificação",
              description: notification.message,
            });
          }
      }
    },
    [queryClient]
  );

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(`${SOCKET_URL}/events`, {
      auth: {
        token: accessToken,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    socket.on("connected", (data: { message: string; userId: string }) => {
      console.log("WebSocket authenticated:", data);
    });

    socket.on("notification", handleNotification);

    socket.on("task_created", (data: unknown) => {
      handleNotification({ type: "task_created", data });
    });

    socket.on("task_updated", (data: unknown) => {
      handleNotification({ type: "task_updated", data });
    });

    socket.on("task_deleted", (data: unknown) => {
      handleNotification({ type: "task_deleted", data });
    });

    socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, accessToken, handleNotification]);

  const subscribe = useCallback((channel: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("subscribe", { channel });
    }
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("unsubscribe", { channel });
    }
  }, []);

  const isConnected = useCallback(() => {
    return socketRef.current?.connected ?? false;
  }, []);

  return {
    subscribe,
    unsubscribe,
    isConnected,
  };
}
