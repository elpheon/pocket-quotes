import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { initializeNotifications } from "@/lib/notifications";
import Feed from "./pages/Feed";
import Saved from "./pages/Saved";
import About from "./pages/About";
import QuoteOfTheDay from "./pages/QuoteOfTheDay";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize notifications and handle notification taps
    initializeNotifications((route) => {
      navigate(route);
    });
  }, [navigate]);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Main content area - takes remaining space above nav */}
      <main className="flex-1 overflow-hidden pb-16">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/daily" element={<QuoteOfTheDay />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
