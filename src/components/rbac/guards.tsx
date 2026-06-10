import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { usePermissions, type AppRole } from "@/hooks/use-permissions";
import { Skeleton } from "@/components/ui/skeleton";

interface AccessDeniedProps {
  titulo?: string;
  mensagem?: string;
}

export function AccessDenied({
  titulo = "Acesso negado",
  mensagem = "Você não tem permissão para acessar esta área.",
}: AccessDeniedProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-semibold">{titulo}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{mensagem}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

interface RequireRoleProps {
  role?: AppRole;
  anyOf?: AppRole[];
  minLevel?: number;
  permission?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function RequireRole({
  role,
  anyOf,
  minLevel,
  permission,
  fallback,
  children,
}: RequireRoleProps) {
  const rbac = usePermissions();
  if (rbac.loading) return <LoadingState />;

  const allowed =
    (role ? rbac.hasRole(role) : true) &&
    (anyOf ? rbac.hasAnyRole(anyOf) : true) &&
    (minLevel ? rbac.hasMinLevel(minLevel) : true) &&
    (permission ? rbac.hasPermission(permission) : true);

  if (!allowed) return <>{fallback ?? <AccessDenied />}</>;
  return <>{children}</>;
}

export function Can({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const rbac = usePermissions();
  if (rbac.loading || !rbac.hasPermission(permission)) return null;
  return <>{children}</>;
}
