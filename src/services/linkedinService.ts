
import { toast } from "sonner";

export const connectToLinkedIn = async (): Promise<boolean> => {
  // In a real app, this would redirect to LinkedIn OAuth flow
  // Here we're implementing a more realistic mock with proper error handling
  
  console.log("Connecting to LinkedIn...");
  
  try {
    // Simulate network request
    const mockAuthUrl = "https://www.linkedin.com/oauth/v2/authorization?mock=true";
    
    // In a real implementation, we would redirect to LinkedIn's OAuth flow
    // window.location.href = mockAuthUrl;
    
    // For our mock, we'll simulate a successful connection
    return new Promise((resolve) => {
      setTimeout(() => {
        // Store connection state in localStorage to persist across page reloads
        localStorage.setItem("linkedinConnected", "true");
        localStorage.setItem("linkedinUser", JSON.stringify({
          name: "Demo User",
          position: "Professional at Company",
          profileImage: "https://via.placeholder.com/150",
          connectedAt: new Date().toISOString()
        }));
        
        toast.success("LinkedIn account connected successfully!");
        resolve(true);
      }, 1500);
    });
  } catch (error) {
    console.error("LinkedIn connection error:", error);
    toast.error("Failed to connect to LinkedIn. Please try again.");
    return false;
  }
};

export const isLinkedInConnected = (): boolean => {
  return localStorage.getItem("linkedinConnected") === "true";
};

export const getLinkedInUser = () => {
  const userData = localStorage.getItem("linkedinUser");
  return userData ? JSON.parse(userData) : null;
};

export const disconnectLinkedIn = (): void => {
  localStorage.removeItem("linkedinConnected");
  localStorage.removeItem("linkedinUser");
  toast.success("LinkedIn account disconnected");
};

export const publishPost = async (
  content: string,
  imageUrl?: string
): Promise<boolean> => {
  // Check if connected first
  if (!isLinkedInConnected()) {
    toast.error("Please connect to LinkedIn before publishing");
    return false;
  }
  
  console.log("Publishing to LinkedIn:", { content, imageUrl });
  
  try {
    // Mock successful publishing
    return new Promise((resolve) => {
      setTimeout(() => {
        toast.success("Post published to LinkedIn successfully!");
        resolve(true);
      }, 1500);
    });
  } catch (error) {
    console.error("LinkedIn publishing error:", error);
    toast.error("Failed to publish to LinkedIn. Please try again.");
    return false;
  }
};

export const schedulePost = async (
  content: string,
  scheduledTime: Date,
  imageUrl?: string
): Promise<boolean> => {
  // Check if connected first
  if (!isLinkedInConnected()) {
    toast.error("Please connect to LinkedIn before scheduling posts");
    return false;
  }
  
  console.log("Scheduling post for:", scheduledTime, { content, imageUrl });
  
  try {
    // Mock successful scheduling
    return new Promise((resolve) => {
      setTimeout(() => {
        toast.success(`Post scheduled for ${scheduledTime.toLocaleString()}`);
        resolve(true);
      }, 1500);
    });
  } catch (error) {
    console.error("LinkedIn scheduling error:", error);
    toast.error("Failed to schedule post on LinkedIn. Please try again.");
    return false;
  }
};

export const getPostAnalytics = async (postId: string) => {
  // Check if connected first
  if (!isLinkedInConnected()) {
    toast.error("Please connect to LinkedIn to view analytics");
    return null;
  }
  
  console.log("Fetching analytics for post:", postId);
  
  try {
    // Mock analytics data
    return {
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 20),
      shares: Math.floor(Math.random() * 15),
      views: Math.floor(Math.random() * 1000) + 200,
    };
  } catch (error) {
    console.error("LinkedIn analytics error:", error);
    toast.error("Failed to fetch post analytics. Please try again.");
    return null;
  }
};
