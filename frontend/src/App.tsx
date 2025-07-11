import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// Import des pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Shops from "./pages/Shops";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ShopDetail from "./pages/ShopDetail";
import ProductDetail from "./pages/ProductDetail";
import ProfilePage from "./pages/ProfilePage";

// Import des composants de structure
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute"; // On importe le gardien

const queryClient = new QueryClient();

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* --- ROUTES PUBLIQUES (Seulement l'accueil et l'authentification) --- */}
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />

          {/* --- ROUTES PROTÉGÉES (Toutes les autres pages) --- */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/shops" element={<Shops />} />
              <Route path="/shops/:shopId" element={<ShopDetail />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:productId" element={<ProductDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profil" element={<ProfilePage />} />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;