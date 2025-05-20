
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
  </QueryClientProvider>
);

export default App;
