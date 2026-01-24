import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { GeometricBackground } from "@/components/GeometricBackground";
import { initializeNotifications } from "@/lib/notifications";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { getTheme, getShowBackground } from "@/lib/settings";
import Feed from "./pages/Feed";
import Saved from "./pages/Saved";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import QuoteOfTheDay from "./pages/QuoteOfTheDay";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Initialize theme on app load (before React renders)
function initializeTheme() {
  const savedTheme = getTheme();
  const isDark = savedTheme === 'dark' || 
    (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Run immediately
initializeTheme();

function AppContent() {
  const navigate = useNavigate();
  const { onTouchStart, onTouchEnd } = useSwipeNavigation();
  const [showBackground, setShowBackground] = useState(getShowBackground());

  useEffect(() => {
    // Initialize notifications and handle notification taps
    initializeNotifications((route) => {
      navigate(route);
    });

    // Listen for background setting changes
    const handleBackgroundChange = (e: CustomEvent<boolean>) => {
      setShowBackground(e.detail);
    };
    window.addEventListener('backgroundSettingChanged', handleBackgroundChange as EventListener);
    return () => {
      window.removeEventListener('backgroundSettingChanged', handleBackgroundChange as EventListener);
    };
  }, [navigate]);

    return (
    <div 
      className="flex h-screen flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Geometric background pattern */}
      {showBackground && <GeometricBackground />}
      
      {/* Main content area - takes remaining space above nav */}
      <main className="flex-1 overflow-hidden pb-16">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/daily" element={<QuoteOfTheDay />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
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
