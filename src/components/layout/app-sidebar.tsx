import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
  ShieldCheck,
  MessagesSquare,
  FileText,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePermissions } from "@/hooks/use-permissions";

const baseItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
];

type Item = { title: string; url: string; icon: typeof LayoutDashboard };

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const rbac = usePermissions();

  const items: Item[] = [...baseItems];
  if (rbac.hasPermission("conteudo.criar")) {
    items.push({ title: "Conteúdo", url: "/conteudo", icon: FileText });
  }
  if (rbac.hasPermission("comentarios.moderar")) {
    items.push({ title: "Moderação", url: "/moderacao", icon: MessagesSquare });
  }
  if (rbac.hasMinLevel(50)) {
    items.push({ title: "Administração", url: "/admin", icon: ShieldCheck });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            AprovaAI
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
