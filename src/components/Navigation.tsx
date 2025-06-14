import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Settings, Layout, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Upload } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const navItems = [
    { path: '/', label: 'Configuration', icon: Settings },
    { path: '/salle', label: 'Ma salle', icon: Layout },
    { path: '/reservations', label: 'Réservations', icon: Calendar },
    { path: '/import-export', label: 'Import / Export', icon: Upload }, // NEW
  ];

  if (isMobile) {
    return (
      <nav className="bg-white border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <SidebarTrigger />
          <h1 className="text-base font-semibold md:text-lg">Salle Magic Planner</h1>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-border px-6 py-4">
      <div className="flex space-x-4">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
              "text-sm md:text-base", // Ajout responsive
              location.pathname === path
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4 md:h-5 md:w-5" />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
