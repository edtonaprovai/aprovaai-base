import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Carrega os papéis do usuário autenticado (com nível) e o conjunto de
 * permissões agregadas. Usa o cliente Supabase autenticado do usuário, com
 * RLS aplicada — não depende de funções SECURITY DEFINER expostas via RPC.
 */
async function carregarRbac(supabase: any, userId: string) {
  const { data: urs, error: urErr } = await supabase
    .from("user_roles")
    .select("role, roles(slug, nivel)")
    .eq("user_id", userId);
  if (urErr) throw new Error("Falha ao verificar acesso.");

  const roles: string[] = (urs ?? []).map((r: any) => r.role);
  const maxLevel: number = (urs ?? []).reduce(
    (acc: number, r: any) => Math.max(acc, r.roles?.nivel ?? 0),
    0,
  );

  let permissions: string[] = [];
  if (roles.length > 0) {
    const { data: rp, error: rpErr } = await supabase
      .from("role_permissions")
      .select("permissions(slug)")
      .in("role", roles as any);
    if (rpErr) throw new Error("Falha ao verificar permissões.");
    permissions = Array.from(
      new Set((rp ?? []).map((row: any) => row.permissions?.slug).filter(Boolean)),
    );
  }

  return { roles, permissions, maxLevel };
}

/**
 * Exige que o usuário autenticado possua a permissão informada.
 */
export function requirePermission(permission: string) {
  return createMiddleware({ type: "function" })
    .middleware([requireSupabaseAuth])
    .server(async ({ next, context }) => {
      const { permissions } = await carregarRbac(context.supabase, context.userId);
      const allowed =
        permissions.includes(permission) || permissions.includes("sistema.administrar");
      if (!allowed) {
        throw new Error(`Acesso negado: requer permissão "${permission}".`);
      }
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
      const { maxLevel, permissions } = await carregarRbac(
        context.supabase,
        context.userId,
      );
      const allowed = maxLevel >= level || permissions.includes("sistema.administrar");
      if (!allowed) {
        throw new Error(`Acesso negado: requer nível mínimo ${level}.`);
      }
      return next({ context });
    });
}
