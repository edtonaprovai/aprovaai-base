import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type AppRole =
  | "aluno"
  | "aluno_premium"
  | "moderador"
  | "gestor_conteudo"
  | "administrador"
  | "super_administrador";

export interface RoleInfo {
  slug: AppRole;
  nome: string;
  descricao: string;
  nivel: number;
}

interface RbacData {
  roles: RoleInfo[];
  permissions: string[];
  maxLevel: number;
}

const EMPTY: RbacData = { roles: [], permissions: [], maxLevel: 0 };

export function usePermissions() {
  const { user, loading } = useAuth();

  const query = useQuery({
    queryKey: ["rbac", user?.id],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async (): Promise<RbacData> => {
      if (!user?.id) return EMPTY;

      const { data: rolesData, error: rolesErr } = await supabase
        .from("user_roles")
        .select("role, roles(slug, nome, descricao, nivel)")
        .eq("user_id", user.id);
      if (rolesErr) throw rolesErr;

      const roles = (rolesData ?? [])
        .map((r: any) => r.roles as RoleInfo | null)
        .filter((r): r is RoleInfo => !!r);

      const roleSlugs = roles.map((r) => r.slug);
      let permissions: string[] = [];
      if (roleSlugs.length > 0) {
        const { data: rp, error: rpErr } = await supabase
          .from("role_permissions")
          .select("permissions(slug)")
          .in("role", roleSlugs);
        if (rpErr) throw rpErr;
        permissions = Array.from(
          new Set((rp ?? []).map((row: any) => row.permissions?.slug).filter(Boolean)),
        );
      }

      const maxLevel = roles.reduce((acc, r) => Math.max(acc, r.nivel), 0);
      return { roles, permissions, maxLevel };
    },
  });

  const data = query.data ?? EMPTY;
  const isSuper = data.permissions.includes("sistema.administrar");

  return {
    loading: loading || query.isLoading,
    roles: data.roles,
    roleSlugs: data.roles.map((r) => r.slug),
    permissions: data.permissions,
    maxLevel: data.maxLevel,
    hasRole: (role: AppRole) => isSuper || data.roles.some((r) => r.slug === role),
    hasAnyRole: (roles: AppRole[]) =>
      isSuper || data.roles.some((r) => roles.includes(r.slug)),
    hasPermission: (perm: string) => isSuper || data.permissions.includes(perm),
    hasMinLevel: (level: number) => isSuper || data.maxLevel >= level,
  };
}
