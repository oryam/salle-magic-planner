
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RestaurantProvider } from "@/context/RestaurantContext";
import Navigation from "@/components/Navigation";
import Configuration from "@/pages/Configuration";
import Salle from "@/pages/Salle";
import Reservations from "@/pages/Reservations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RestaurantProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navigation />
            <Routes>
              <Route path="/" element={<Configuration />} />
              <Route path="/salle" element={<Salle />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </RestaurantProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
