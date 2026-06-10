import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Exige que o usuário autenticado possua a permissão informada.
 * Uso: `.middleware([requirePermission("conteudo.criar")])`
 */
export function requirePermission(permission: string) {
  return createMiddleware({ type: "function" })
    .middleware([requireSupabaseAuth])
    .server(async ({ next, context }) => {
      const { data, error } = await context.supabase.rpc("has_permission", {
        _user_id: context.userId,
        _permission: permission,
      });
      if (error) throw new Error("Falha ao verificar permissão.");
      if (!data) throw new Error(`Acesso negado: requer permissão "${permission}".`);
      return next({ context });
    });
}

/**
 * Exige que o usuário possua pelo menos um dos papéis informados.
 */
export function requireRole(...roles: string[]) {
  return createMiddleware({ type: "function" })
    .middleware([requireSupabaseAuth])
    .server(async ({ next, context }) => {
      const { data, error } = await context.supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", context.userId)
        .in("role", roles as any);
      if (error) throw new Error("Falha ao verificar papel.");
      if (!data || data.length === 0) {
        throw new Error(`Acesso negado: requer um dos papéis [${roles.join(", ")}].`);
      }
      return next({ context });
    });
}

/**
 * Exige nível hierárquico mínimo (10=Aluno, 20=Premium, 30=Moderador,
 * 40=Gestor de Conteúdo, 50=Administrador, 100=Super Administrador).
 */
export function requireMinLevel(level: number) {
  return createMiddleware({ type: "function" })
    .middleware([requireSupabaseAuth])
    .server(async ({ next, context }) => {
      const { data, error } = await context.supabase.rpc("has_min_role_level", {
        _user_id: context.userId,
        _min_level: level,
      });
      if (error) throw new Error("Falha ao verificar nível de acesso.");
      if (!data) throw new Error(`Acesso negado: requer nível mínimo ${level}.`);
      return next({ context });
    });
}
