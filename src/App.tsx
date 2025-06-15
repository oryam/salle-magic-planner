
import React, { useEffect, useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RestaurantProvider } from "@/context/RestaurantContext";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Navigation from "@/components/Navigation";
import Configuration from "@/pages/Configuration";
import Salle from "@/pages/Salle";
import Reservations from "@/pages/Reservations";
import NotFound from "./pages/NotFound";
import ImportExport from "@/pages/ImportExport";
import Statistiques from "@/pages/Statistiques";
import { useIsMobile } from "@/hooks/use-mobile";
import { StartupGuide } from "@/components/StartupGuide";

const queryClient = new QueryClient();

const LOCALSTORAGE_KEY = "hideStartupGuide";

const App = () => {
  // Contrôle de l’affichage du guide de démarrage
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const hideGuide = localStorage.getItem(LOCALSTORAGE_KEY);
    setShowGuide(hideGuide !== "1");
  }, []);

  // Ouverture manuelle du guide depuis la barre de navigation
  const handleOpenGuide = useCallback(() => {
    setShowGuide(true);
  }, []);

  const handleCloseGuide = useCallback(() => {
    setShowGuide(false);
  }, []);

  // Wrapper pour utiliser le hook useIsMobile()
  function MainWrapper() {
    const isMobile = useIsMobile();

    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            {/* Affiche uniquement Navigation sur mobile */}
            {isMobile && <Navigation onShowHelp={handleOpenGuide} />}
            <Routes>
              <Route path="/" element={<Configuration />} />
              <Route path="/salle" element={<Salle />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/statistiques" element={<Statistiques />} />
              <Route path="/import-export" element={<ImportExport />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RestaurantProvider>
          <BrowserRouter>
            <StartupGuide open={showGuide} onClose={handleCloseGuide} />
            {/* Passe la prop onShowHelp à Navigation pour desktop */}
            <Navigation onShowHelp={handleOpenGuide} />
            <MainWrapper />
          </BrowserRouter>
        </RestaurantProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

