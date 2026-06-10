import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";
import { RequireRole } from "@/components/rbac/guards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/moderacao")({
  component: () => (
    <RequireRole permission="comentarios.moderar">
      <ModeracaoPage />
    </RequireRole>
  ),
});

function ModeracaoPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Moderação</h1>
        <p className="text-sm text-muted-foreground">
          Revise e modere comentários e interações da comunidade.
        </p>
      </header>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessagesSquare className="h-5 w-5 text-primary" />
            <CardTitle>Fila de moderação</CardTitle>
          </div>
          <CardDescription>Nenhum item pendente no momento.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Quando comentários forem sinalizados, eles aparecerão aqui.
        </CardContent>
      </Card>
    </div>
  );
}
