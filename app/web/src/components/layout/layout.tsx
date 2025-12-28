import { Toaster } from "@/components/ui/toaster";
import { useWebSocket } from "@/hooks/use-websocket";
import type { ReactNode } from "react";
import { Header } from "./header";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Initialize WebSocket connection
  useWebSocket();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">{children}</main>
      <Toaster />
    </div>
  );
}
