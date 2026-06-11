-- Revogar EXECUTE de funções SECURITY DEFINER para usuários autenticados/anônimos.
-- Funções de trigger (handle_new_user, update_updated_at_column) só precisam ser
-- executáveis pelo dono da tabela. Funções de checagem (has_role, has_permission,
-- has_min_role_level) são usadas apenas via RLS USING() — executadas como definer
-- automaticamente — e nunca devem ser chamadas diretamente pelo cliente.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_min_role_level(uuid, integer) FROM PUBLIC, anon, authenticated;
