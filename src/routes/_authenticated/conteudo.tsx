import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { RequireRole } from "@/components/rbac/guards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/conteudo")({
  component: () => (
    <RequireRole permission="conteudo.criar">
      <ConteudoPage />
    </RequireRole>
  ),
});

function ConteudoPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Gestão de Conteúdo</h1>
        <p className="text-sm text-muted-foreground">
          Crie, edite e publique materiais de estudo.
        </p>
      </header>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Seus conteúdos</CardTitle>
          </div>
          <CardDescription>Em breve: lista de conteúdos publicados e rascunhos.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Nenhum conteúdo criado ainda.
        </CardContent>
      </Card>
    </div>
  );
}
