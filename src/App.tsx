import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Stations from "./pages/Stations";
import Dashboard from "./pages/Dashboard";
import Support from "./pages/Support";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Payments from "./pages/Payments";
import Profile from "./pages/Profile";
import { SparkCoinsProvider } from "./context/SparkCoinsContext";
import { AuthProvider } from '@/context/AuthContext';
import Home from '@/pages/Home';
import StationDetails from '@/pages/StationDetails';
import PaymentDashboard from '@/pages/PaymentDashboard';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SparkCoinsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stations" element={<Stations />} />
              <Route path="/stations/:id" element={<StationDetails />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/payment-dashboard" element={<PaymentDashboard />} />
              <Route path="/support" element={<Support />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/profile" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SparkCoinsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
