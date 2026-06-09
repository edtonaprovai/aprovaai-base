export function AppFooter() {
  return (
    <footer className="border-t bg-background px-4 py-4 text-center text-xs text-muted-foreground md:px-6">
      © {new Date().getFullYear()} AprovaAI · Todos os direitos reservados
    </footer>
  );
}
