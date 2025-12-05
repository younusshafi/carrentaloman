import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Fleet from "./pages/Fleet";
import VehicleDetail from "./pages/VehicleDetail";
import Rentals from "./pages/Rentals";
import Customers from "./pages/Customers";
import Financials from "./pages/Financials";
import Maintenance from "./pages/Maintenance";
import Fines from "./pages/Fines";
import Insurance from "./pages/Insurance";
import WhatsApp from "./pages/WhatsApp";
import DataImport from "./pages/DataImport";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/fleet/:id" element={<VehicleDetail />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/rentals/:id" element={<Rentals />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<Customers />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/fines" element={<Fines />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/whatsapp" element={<WhatsApp />} />
          <Route path="/import" element={<DataImport />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
