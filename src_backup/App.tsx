
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GeneratePage from "./pages/GeneratePage";
import ApprovePage from "./pages/ApprovePage";
import SchedulePage from "./pages/SchedulePage";
import NotFound from "./pages/NotFound";
import { PostProvider } from "./contexts/PostContext";
import { ThemeProvider } from "./components/theme/ThemeProvider";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Set document title
    document.title = "LinkedAI";
    
    // Clean up by removing any Lovable badges
    const badges = document.querySelectorAll('[data-lovable-badge]');
    badges.forEach(badge => badge.remove());
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <PostProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/generate" element={<GeneratePage />} />
                <Route path="/approve" element={<ApprovePage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </PostProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
