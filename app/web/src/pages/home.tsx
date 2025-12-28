import { AuthModal } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Bell, CheckSquare, ListTodo, Shield } from "lucide-react";
import { useState } from "react";

export function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="text-center space-y-6 max-w-3xl px-4">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <CheckSquare className="h-10 w-10 text-primary" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Gerencie suas tarefas com{" "}
            <span className="text-primary">facilidade</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            O TaskManager ajuda você a organizar, priorizar e acompanhar todas
            as suas tarefas em um único lugar. Simples, rápido e eficiente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {isAuthenticated ? (
              <Link to="/tasks">
                <Button size="lg" className="gap-2">
                  Ver minhas tarefas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => setAuthModalOpen(true)}
                  className="gap-2"
                >
                  Começar agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setAuthModalOpen(true)}
                >
                  Já tenho conta
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 max-w-4xl px-4">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ListTodo className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Organize tarefas</h3>
            <p className="text-sm text-muted-foreground">
              Crie, edite e organize suas tarefas com prioridades e prazos.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Notificações em tempo real</h3>
            <p className="text-sm text-muted-foreground">
              Receba atualizações instantâneas sobre suas tarefas.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Seguro e confiável</h3>
            <p className="text-sm text-muted-foreground">
              Seus dados estão protegidos com autenticação JWT.
            </p>
          </div>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
