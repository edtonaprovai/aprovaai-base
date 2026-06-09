import { Loader2 } from "lucide-react";

export function LoadingScreen({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
