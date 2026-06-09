import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, FileText, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — AprovaAI" }],
  }),
  component: DashboardPage,
});

const metricas = [
  { titulo: "Aprovações pendentes", valor: "0", icone: Clock, cor: "text-primary" },
  { titulo: "Aprovadas hoje", valor: "0", icone: CheckCircle2, cor: "text-success" },
  { titulo: "Solicitações totais", valor: "0", icone: FileText, cor: "text-primary-glow" },
  { titulo: "Membros ativos", valor: "1", icone: Users, cor: "text-accent-foreground" },
];

function DashboardPage() {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("nome_completo, empresa")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const nome = profile?.nome_completo || user?.email?.split("@")[0] || "por aí";

  return (
    <div className="space-y-6">
      <div>
        {isLoading ? (
          <Skeleton className="h-8 w-64" />
        ) : (
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Olá, {nome} 👋
          </h1>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Bem-vindo ao seu painel AprovaAI. Aqui você acompanha suas aprovações.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricas.map((m) => (
          <Card key={m.titulo}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {m.titulo}
              </CardTitle>
              <m.icone className={`h-4 w-4 ${m.cor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{m.valor}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Começando com o AprovaAI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Sua conta foi criada com sucesso. Em breve você poderá:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Criar fluxos de aprovação personalizados</li>
            <li>Convidar membros da sua equipe</li>
            <li>Acompanhar métricas e histórico completo</li>
            <li>Integrar com suas ferramentas favoritas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
