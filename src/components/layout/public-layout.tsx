import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold">AprovaAI</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/cadastro">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-background px-4 py-6 md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} AprovaAI</span>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-foreground">Entrar</Link>
            <Link to="/cadastro" className="hover:text-foreground">Cadastro</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
