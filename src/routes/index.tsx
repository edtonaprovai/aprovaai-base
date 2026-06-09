import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AprovaAI — Aprovações inteligentes com IA" },
      {
        name: "description",
        content: "Automatize fluxos de aprovação com IA. Decisões mais rápidas, seguras e auditáveis.",
      },
      { property: "og:title", content: "AprovaAI" },
      { property: "og:description", content: "Aprovações inteligentes com IA." },
    ],
  }),
  component: HomePage,
});

const features = [
  {
    icon: Zap,
    title: "Rapidez",
    desc: "Reduza semanas de espera a minutos com automações inteligentes.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança",
    desc: "Trilhas de auditoria completas e controle granular de acesso.",
  },
  {
    icon: Sparkles,
    title: "IA integrada",
    desc: "Sugestões e análises automáticas para cada solicitação.",
  },
];

function HomePage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-accent/50 px-3 py-1 text-xs font-medium text-accent-foreground">
            <Sparkles className="h-3 w-3" /> Plataforma SaaS
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
            Aprovações inteligentes,{" "}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              decisões em segundos
            </span>
          </h1>
          <p className="mt-6 text-base text-muted-foreground md:text-lg">
            O AprovaAI usa inteligência artificial para acelerar seus fluxos de aprovação,
            mantendo total controle e rastreabilidade.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/cadastro">
                Criar conta grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}>
              <CardContent className="pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
