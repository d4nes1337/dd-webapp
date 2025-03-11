import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { initTelegramWebApp } from "./utils/telegramUtils";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Component to initialize Telegram WebApp
const TelegramInitializer = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Telegram WebApp
    initTelegramWebApp();

    // Check if we need to handle any Telegram-specific routing
    const handleTelegramRouting = () => {
      // Example: If opened directly to a specific path from Telegram
      // This is just an example - modify according to your actual needs
      if (location.pathname === "/telegram-start") {
        navigate("/");
      }
    };

    handleTelegramRouting();
  }, [location, navigate]);

  return <>{children}</>;
};

const App = () => (
  <ThemeProvider defaultTheme="dark" attribute="class">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <CartProvider>
            <Toaster />
            <Sonner position="top-center" />
            <HashRouter>
              <TelegramInitializer>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:productId" element={<ProductDetails />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TelegramInitializer>
            </HashRouter>
          </CartProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
