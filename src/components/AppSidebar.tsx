
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Settings, Layout, Calendar } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Upload } from "lucide-react";
import { ChartLine } from "lucide-react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

interface AppSidebarProps {
  onShowHelp?: () => void;
}

export function AppSidebar({ onShowHelp }: AppSidebarProps) {
  const location = useLocation();
  const { isMobile, open } = useSidebar();

  const navItems = [
    { path: '/', label: 'Configuration', icon: Settings },
    { path: '/salle', label: 'Ma salle', icon: Layout },
    { path: '/reservations', label: 'Réservations', icon: Calendar },
    { path: '/statistiques', label: 'Statistiques', icon: ChartLine },
    { path: '/import-export', label: 'Import / Export', icon: Upload },
  ];

  // ferme la sidebar mobile lors d'un clic sur lien de navigation
  const handleNavClick = () => {
    if (isMobile && typeof window !== "undefined") {
      const sidebar = document.querySelector('[data-sidebar="sidebar"]');
      if (sidebar) {
        sidebar.dispatchEvent(new Event("close"));
      }
    }
  };

  return (
    <Sidebar>
      {/* En-tête avec bouton aide et titre, plus bouton ouverture/fermeture si ouvert seulement */}
      {open && (
        <div className="flex items-center gap-2 py-2 px-3 border-b border-sidebar-border">
          <SidebarTrigger />
          <span className="text-lg font-semibold">Salle Magic Planner</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Aide"
            onClick={onShowHelp}
            className="ml-auto"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      )}
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
