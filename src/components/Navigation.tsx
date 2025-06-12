
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Settings, Layout, Calendar } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Configuration', icon: Settings },
    { path: '/salle', label: 'Ma salle', icon: Layout },
    { path: '/reservations', label: 'Réservations', icon: Calendar }
  ];

  return (
    <nav className="bg-white border-b border-border px-6 py-4">
      <div className="flex space-x-8">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
              location.pathname === path
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
