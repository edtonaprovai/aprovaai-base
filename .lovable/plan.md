# Plano — Fundação AprovaAI

SaaS em React + TypeScript + Tailwind (TanStack Start) com Lovable Cloud (Supabase) já preparado para escalar. Todo o conteúdo em português do Brasil.

## 1. Backend (Lovable Cloud / Supabase)

Ativar Lovable Cloud e criar via migration:

- **Enum `app_role`**: `admin`, `user`.
- **Tabela `profiles`** (id = auth.users.id, nome_completo, avatar_url, empresa, telefone, created_at, updated_at) com RLS: usuário lê/atualiza só o próprio perfil.
- **Tabela `user_roles`** (user_id, role) — roles separadas (nunca em profiles).
- **Função `has_role(uuid, app_role)`** SECURITY DEFINER.
- **Trigger `handle_new_user`** em `auth.users` → cria linha em `profiles` e atribui role `user` automaticamente (usa metadata `nome_completo` do signup).
- **Trigger `update_updated_at`** genérico.
- GRANTs corretos em `public.profiles` e `public.user_roles` para `authenticated` + `service_role`.

Configurar provider **Google** via `supabase--configure_social_auth`. E-mail/senha já vem habilitado.

## 2. Tema (claro + escuro com toggle)

- `src/styles.css`: paleta azul corporativo em OKLCH para `:root` (claro) e `.dark` (escuro). Tokens primários ≈ `#2563EB` / accent `#60A5FA` / background `#F8FAFC` (claro) e `#0F172A` (escuro).
- `ThemeProvider` próprio (sem dependência extra) com persistência em `localStorage` e classe `dark` no `<html>`.
- Componente `ThemeToggle` (sol/lua) no Header.

## 3. Integração Supabase no front

- `src/integrations/supabase/client.ts` (browser) — já gerado pela Cloud.
- `src/integrations/supabase/auth-middleware.ts` para server functions autenticadas.
- Layout `_authenticated/route.tsx` (gerenciado pela integração, `ssr:false`, redireciona para `/login`).
- `attachSupabaseAuth` registrado em `src/start.ts`.
- Listener único de `onAuthStateChange` no `__root.tsx` (invalida router e queries em SIGNED_IN/OUT/USER_UPDATED).

## 4. Estrutura de rotas

```text
src/routes/
  __root.tsx              (shell + providers + listener auth + Toaster)
  index.tsx               (Home — pública, landing)
  login.tsx               (pública)
  cadastro.tsx            (pública)
  recuperar-senha.tsx     (pública — envia e-mail)
  redefinir-senha.tsx     (pública — destino do link de recuperação)
  _authenticated/
    route.tsx             (gate gerenciado)
    dashboard.tsx         (privada)
```

Rotas autenticadas usam o AppLayout (Sidebar + Header + Footer + `<Outlet />`). Rotas públicas usam um MarketingLayout simples (Header público + Footer).

## 5. Componentes de layout (mobile-first, responsivos)

- **AppSidebar** (shadcn sidebar, `collapsible="icon"`): Dashboard, Perfil, Configurações (placeholders). Em mobile vira off-canvas via `SidebarTrigger` no Header.
- **AppHeader**: trigger da sidebar, busca (placeholder), `ThemeToggle`, menu do usuário (avatar → Perfil, Sair).
- **AppFooter**: copyright AprovaAI + links institucionais.
- **PublicHeader / PublicFooter** para Home e telas de auth.
- **SidebarProvider** envolve o AppLayout; `w-full` no wrapper.

## 6. Páginas

- **Home (`/`)**: hero "AprovaAI — Aprovações inteligentes com IA", seção de features (3 cards), CTA para `/cadastro` e `/login`. SEO via `head()`.
- **Login (`/login`)**: e-mail + senha, botão "Entrar com Google" (via `supabase.auth.signInWithOAuth` com `redirectTo`), link para cadastro e recuperar senha. Form com `react-hook-form` + zod.
- **Cadastro (`/cadastro`)**: nome completo, e-mail, senha, confirmação. `signUp` com `emailRedirectTo: window.location.origin` e `data: { nome_completo }`.
- **Recuperar Senha (`/recuperar-senha`)**: e-mail → `resetPasswordForEmail` com `redirectTo: origin + '/redefinir-senha'`.
- **Redefinir Senha (`/redefinir-senha`)**: detecta `type=recovery`, formulário de nova senha → `updateUser({ password })`.
- **Dashboard (`/dashboard`)**: saudação ao usuário (lê `profiles`), 4 cards de métricas placeholder, área de boas-vindas.

Já autenticado → login/cadastro redirecionam para `/dashboard`.

## 7. Estados de carregamento e erros

- `errorComponent` + `notFoundComponent` em cada rota com loader; `defaultErrorComponent` no router.
- Boundary de erro raiz já existe — manter e traduzir mensagens.
- Skeletons (shadcn `Skeleton`) para Dashboard e Header.
- `Toaster` (sonner) global para feedback de auth (login com sucesso, erro de credenciais, e-mail enviado, etc.) — todas mensagens em pt-BR.
- Tratamento explícito de erros do Supabase Auth com mapeamento PT-BR (e-mail já cadastrado, credenciais inválidas, etc.).

## 8. Navegação

- `<Link>` do TanStack Router em toda navegação clicável.
- Estados ativos no Sidebar via `useRouterState` + `activeProps`.
- Sign-out: cancel queries → clear cache → `signOut` → `navigate({ to: '/login', replace: true })`.

## 9. Preparação para escalabilidade

- Pastas: `src/components/layout`, `src/components/ui`, `src/features/auth`, `src/features/dashboard`, `src/lib`, `src/hooks`, `src/integrations/supabase`.
- Hook `useAuth` (sessão + perfil + roles) consumido nos componentes.
- Schemas zod centralizados por feature.
- Convenção: dados sensíveis sempre via `createServerFn` + `requireSupabaseAuth`; leituras simples do próprio usuário via browser client + RLS.
- Sidebar/Header preparados para receber novas seções (mapa de itens em um array).
- Design tokens semânticos no `styles.css` (sem cores hard-coded nos componentes).

## 10. Detalhes técnicos

- Stack: TanStack Start v1, React 19, Tailwind v4 (CSS-first em `styles.css`), shadcn/ui, lucide-react, react-hook-form + zod, sonner.
- Mobile-first: classes base sem prefixo + `md:` / `lg:` para telas maiores. Sidebar colapsa para off-canvas < `md`.
- Acessibilidade: labels em todos os inputs, contraste validado em claro/escuro, `aria-label` no toggle de tema e trigger de sidebar.
- SEO: cada rota pública com `head()` próprio (title, description, og:title, og:description) em pt-BR.

## Fora de escopo (próximos passos sugeridos)

- Funcionalidades de negócio do AprovaAI (fluxos de aprovação, IA).
- Páginas de Perfil/Configurações (apenas links placeholder no Sidebar).
- Pagamentos, billing, multi-tenant.
