import { AuthModal } from "@/components/auth";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth";
import { Link } from "@tanstack/react-router";
import { CheckSquare, Kanban, LogOut, User } from "lucide-react";
import { useState } from "react";

export function Header() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useLogout();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TaskManager</span>
          </Link>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/tasks">
                  <Button variant="ghost">Tarefas</Button>
                </Link>

                <Link to="/boards">
                  <Button variant="ghost">
                    <Kanban className="mr-2 h-4 w-4" />
                    Boards
                  </Button>
                </Link>

                <NotificationsDropdown />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user?.username || user?.email || "U")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.username || "Usuário"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setAuthModalOpen(true)}>
                  Entrar
                </Button>
                <Button onClick={() => setAuthModalOpen(true)}>
                  Criar conta
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
