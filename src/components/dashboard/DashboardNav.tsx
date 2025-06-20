
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar'; 
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { LogOut, LayoutDashboard, UsersRound, Mountain, Megaphone, Settings, Building2, CalendarDays, ShoppingCart } from 'lucide-react';
import type { Role } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  allowedRoles?: Role[]; // Optional: specify which roles can see this item
}

// Define navigation items
const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Menú Principal', icon: LayoutDashboard },
  {
    href: '/dashboard/oficina-tecnica', 
    label: 'Oficina Técnica',
    icon: Building2,
  },
  { 
    href: '/dashboard/compras', 
    label: 'Área de Compras', 
    icon: ShoppingCart,
    // allowedRoles: ['Compras'] // No longer restricted
  },
  { href: '/dashboard/recursos-humanos', label: 'Recursos Humanos', icon: UsersRound },
  { href: '/dashboard/caliza', label: 'Caliza', icon: Mountain },
  { href: '/dashboard/eventos', label: 'Eventos', icon: Megaphone },
  { href: '/dashboard/sala-reuniones', label: 'Sala de Reuniones', icon: CalendarDays },
];

export default function DashboardNav({ children }: { children: React.ReactNode }) {
  const { userRole, logout } = useAuth();
  const pathname = usePathname();

  const visibleNavItems = navItems.filter(item => {
    if (!item.allowedRoles) return true; // If no roles specified, item is visible to all
    if (!userRole) return false; // If user has no role, hide role-specific items
    return item.allowedRoles.includes(userRole);
  });

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="border-r no-print">
        <SidebarHeader className="p-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="https://placehold.co/40x40/2a3045/FFFFFF.png?text=GN" alt="Logo Grupo Nioi" width={32} height={32} className="rounded-sm" data-ai-hint="company logo new"/>
            <h1 className="text-lg font-semibold font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">GRUPO NIOI</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <ScrollArea className="h-full">
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.href || item.label}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                      tooltip={{ children: item.label, side: 'right' }}
                      className="justify-start"
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto border-t">
          <div className="mb-2 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-sidebar-foreground">{userRole}</p>
            <p className="text-xs text-sidebar-foreground/70">Rol Activo</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="mr-2 h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden">Cerrar sesión</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between h-14 px-4 border-b bg-background sm:justify-end no-print">
          <SidebarTrigger className="sm:hidden" />
          <div className="flex items-center gap-2">
             <span className="text-sm text-muted-foreground hidden sm:inline">Usuario: {userRole}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
