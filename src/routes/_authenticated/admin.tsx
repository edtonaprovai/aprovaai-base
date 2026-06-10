import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, ShieldCheck, KeyRound } from "lucide-react";

import { RequireRole } from "@/components/rbac/guards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: () => (
    <RequireRole minLevel={50}>
      <AdminPage />
    </RequireRole>
  ),
});

function AdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "rbac-overview"],
    queryFn: async () => {
      const [roles, perms] = await Promise.all([
        supabase.from("roles").select("*").order("nivel"),
        supabase.from("permissions").select("*").order("categoria"),
      ]);
      if (roles.error) throw roles.error;
      if (perms.error) throw perms.error;
      return { roles: roles.data ?? [], permissions: perms.data ?? [] };
    },
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Administração</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral dos papéis e permissões disponíveis na plataforma.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle>Papéis</CardTitle>
            </div>
            <CardDescription>Hierarquia de acesso da plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))
              : data?.roles.map((r) => (
                  <div
                    key={r.slug}
                    className="flex items-start justify-between rounded-md border p-3"
                  >
                    <div>
                      <div className="font-medium">{r.nome}</div>
                      <div className="text-xs text-muted-foreground">{r.descricao}</div>
                    </div>
                    <Badge variant="secondary">nível {r.nivel}</Badge>
                  </div>
                ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <CardTitle>Permissões</CardTitle>
            </div>
            <CardDescription>Ações controladas por RBAC.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              : data?.permissions.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-md border p-2 text-sm"
                  >
                    <div>
                      <code className="text-xs">{p.slug}</code>
                      <div className="text-xs text-muted-foreground">{p.descricao}</div>
                    </div>
                    <Badge variant="outline">{p.categoria}</Badge>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Gestão de usuários</CardTitle>
          </div>
          <CardDescription>
            Em breve: atribuir e revogar papéis dos usuários da plataforma.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
