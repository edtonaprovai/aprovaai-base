-- 1. Estender enum app_role
ALTER TYPE public.app_role RENAME VALUE 'user' TO 'aluno';
ALTER TYPE public.app_role RENAME VALUE 'admin' TO 'administrador';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'aluno_premium';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderador';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'gestor_conteudo';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_administrador';
