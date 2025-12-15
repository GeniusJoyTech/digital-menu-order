import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MenuProvider } from "@/contexts/MenuContext";
import { DesignProvider } from "@/contexts/DesignContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MenuProvider>
        <DesignProvider>
          <CheckoutProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/:mesa" element={<Index />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CheckoutProvider>
        </DesignProvider>
      </MenuProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
