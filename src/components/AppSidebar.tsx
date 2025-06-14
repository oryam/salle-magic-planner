
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Settings, Layout, Calendar, Import } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar, // <- ajout de l'import
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  const navItems = [
    { path: '/', label: 'Configuration', icon: Settings },
    { path: '/salle', label: 'Ma salle', icon: Layout },
    { path: '/reservations', label: 'Réservations', icon: Calendar },
    { path: '/import-export', label: 'Import/Export', icon: Import }
  ];

  // ferme la sidebar mobile lors d'un clic sur lien de navigation
  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ path, label, icon: Icon }) => (
                <SidebarMenuItem key={path}>
                  <SidebarMenuButton asChild isActive={location.pathname === path}>
                    <Link to={path} onClick={handleNavClick}>
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
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
