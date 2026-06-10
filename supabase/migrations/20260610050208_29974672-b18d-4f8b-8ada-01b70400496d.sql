-- 2. Tabela de catálogo de papéis (metadados)
CREATE TABLE public.roles (
  slug public.app_role PRIMARY KEY,
  nome text NOT NULL,
  descricao text NOT NULL,
  nivel integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Catalogo de papeis e legivel por autenticados"
  ON public.roles FOR SELECT TO authenticated USING (true);

INSERT INTO public.roles (slug, nome, descricao, nivel) VALUES
  ('aluno', 'Aluno', 'Acesso padrão ao conteúdo de estudo.', 10),
  ('aluno_premium', 'Aluno Premium', 'Acesso completo a conteúdos e recursos exclusivos.', 20),
  ('moderador', 'Moderador', 'Modera comentários, dúvidas e interações da comunidade.', 30),
  ('gestor_conteudo', 'Gestor de Conteúdo', 'Cria, edita e publica materiais de estudo.', 40),
  ('administrador', 'Administrador', 'Gerencia usuários, papéis e configurações da plataforma.', 50),
  ('super_administrador', 'Super Administrador', 'Acesso irrestrito ao sistema.', 100);

-- 3. Tabela de permissões
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  categoria text NOT NULL,
  descricao text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permissoes sao legiveis por autenticados"
  ON public.permissions FOR SELECT TO authenticated USING (true);

INSERT INTO public.permissions (slug, categoria, descricao) VALUES
  ('conteudo.visualizar', 'conteudo', 'Visualizar conteúdos publicados'),
  ('conteudo.premium.visualizar', 'conteudo', 'Visualizar conteúdos premium'),
  ('conteudo.criar', 'conteudo', 'Criar novos conteúdos'),
  ('conteudo.editar', 'conteudo', 'Editar conteúdos existentes'),
  ('conteudo.publicar', 'conteudo', 'Publicar ou despublicar conteúdos'),
  ('conteudo.excluir', 'conteudo', 'Excluir conteúdos'),
  ('comentarios.criar', 'comunidade', 'Publicar comentários e dúvidas'),
  ('comentarios.moderar', 'comunidade', 'Moderar comentários e tópicos'),
  ('usuarios.visualizar', 'admin', 'Visualizar lista de usuários'),
  ('usuarios.gerenciar', 'admin', 'Editar dados e papéis de usuários'),
  ('papeis.atribuir', 'admin', 'Atribuir ou remover papéis de usuários'),
  ('plataforma.configurar', 'admin', 'Alterar configurações globais da plataforma'),
  ('sistema.administrar', 'sistema', 'Acesso irrestrito ao sistema');

-- 4. Vínculo papel ↔ permissão
CREATE TABLE public.role_permissions (
  role public.app_role NOT NULL REFERENCES public.roles(slug) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (role, permission_id)
);

GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vinculos papel-permissao sao legiveis por autenticados"
  ON public.role_permissions FOR SELECT TO authenticated USING (true);

-- Seed dos vínculos
WITH p AS (SELECT id, slug FROM public.permissions)
INSERT INTO public.role_permissions (role, permission_id)
SELECT v.role::public.app_role, p.id
FROM (VALUES
  -- Aluno
  ('aluno', 'conteudo.visualizar'),
  ('aluno', 'comentarios.criar'),
  -- Aluno Premium (herda aluno)
  ('aluno_premium', 'conteudo.visualizar'),
  ('aluno_premium', 'comentarios.criar'),
  ('aluno_premium', 'conteudo.premium.visualizar'),
  -- Moderador (herda aluno + modera)
  ('moderador', 'conteudo.visualizar'),
  ('moderador', 'conteudo.premium.visualizar'),
  ('moderador', 'comentarios.criar'),
  ('moderador', 'comentarios.moderar'),
  -- Gestor de Conteúdo
  ('gestor_conteudo', 'conteudo.visualizar'),
  ('gestor_conteudo', 'conteudo.premium.visualizar'),
  ('gestor_conteudo', 'comentarios.criar'),
  ('gestor_conteudo', 'conteudo.criar'),
  ('gestor_conteudo', 'conteudo.editar'),
  ('gestor_conteudo', 'conteudo.publicar'),
  ('gestor_conteudo', 'conteudo.excluir'),
  -- Administrador
  ('administrador', 'conteudo.visualizar'),
  ('administrador', 'conteudo.premium.visualizar'),
  ('administrador', 'comentarios.criar'),
  ('administrador', 'comentarios.moderar'),
  ('administrador', 'conteudo.criar'),
  ('administrador', 'conteudo.editar'),
  ('administrador', 'conteudo.publicar'),
  ('administrador', 'conteudo.excluir'),
  ('administrador', 'usuarios.visualizar'),
  ('administrador', 'usuarios.gerenciar'),
  ('administrador', 'papeis.atribuir'),
  ('administrador', 'plataforma.configurar'),
  -- Super Administrador
  ('super_administrador', 'sistema.administrar')
) AS v(role, perm)
JOIN p ON p.slug = v.perm;

-- 5. Função de checagem de permissão
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = _user_id
      AND (p.slug = _permission OR p.slug = 'sistema.administrar')
  )
$$;

-- 6. Função de nível mínimo (hierarquia)
CREATE OR REPLACE FUNCTION public.has_min_role_level(_user_id uuid, _min_level integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.slug = ur.role
    WHERE ur.user_id = _user_id
      AND r.nivel >= _min_level
  )
$$;

-- 7. Bloquear execução por anon (resolve aviso do linter)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_min_role_level(uuid, integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_min_role_level(uuid, integer) TO authenticated, service_role;

-- 8. Atualizar trigger de novo usuário para usar 'aluno'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome_completo', NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'aluno');

  RETURN NEW;
END;
$$;

-- Garantir trigger ativo em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
