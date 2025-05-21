
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import ApprovePage from "@/pages/ApprovePage";
import GeneratePage from "@/pages/GeneratePage";
import IndexPage from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import SchedulePage from "@/pages/SchedulePage";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PostProvider, usePostContext } from "@/contexts/PostContext";
import { isLinkedInConnected } from "@/services/linkedinService";

// Function to initialize LinkedIn-related functionality
const AppInitializer = () => {
  const { fetchUserPosts } = usePostContext();
  
  useEffect(() => {
    // Check if user is connected to LinkedIn and fetch their posts if so
    if (isLinkedInConnected()) {
      fetchUserPosts();
    }
    
    // Set up an interval to check local storage for connection changes
    const checkConnectionInterval = setInterval(() => {
      const wasConnected = localStorage.getItem("wasLinkedInConnected") === "true";
      const isConnected = isLinkedInConnected();
      
      // If connection status changed from disconnected to connected
      if (!wasConnected && isConnected) {
        fetchUserPosts();
        localStorage.setItem("wasLinkedInConnected", "true");
      } else if (wasConnected && !isConnected) {
        // Update the tracking variable if disconnected
        localStorage.setItem("wasLinkedInConnected", "false");
      }
    }, 5000);
    
    // Initialize wasLinkedInConnected in localStorage
    localStorage.setItem("wasLinkedInConnected", isLinkedInConnected() ? "true" : "false");
    
    return () => {
      clearInterval(checkConnectionInterval);
    };
  }, [fetchUserPosts]);
  
  return null;
};

const App = () => {
  return (
    <ThemeProvider>
      <PostProvider>
        <BrowserRouter>
          <AppInitializer />
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/generate" element={<GeneratePage />} />
            <Route path="/approve" element={<ApprovePage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors closeButton position="top-right" />
      </PostProvider>
    </ThemeProvider>
  );
};

export default App;
