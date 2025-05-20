
import { toast } from "sonner";

// Create a function to open the LinkedIn auth popup
const openLinkedInAuthPopup = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Calculate popup dimensions and position
    const width = 600;
    const height = 700;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    // Open the popup with blank content initially
    const popup = window.open(
      "about:blank",
      "LinkedIn Login",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      toast.error("Popup blocked! Please allow popups for this site.");
      resolve(false);
      return;
    }

    // Fetch the HTML content from the endpoint and log it
    fetch("https://linkedai-backend.vercel.app/api/auth/linkedin")
      .then(response => response.text())
      .then(html => {
        // Log the HTML response
        console.log("LinkedIn Auth HTML Response:", html);
        
        // Write the fetched HTML directly to the popup document
        popup.document.open();
        popup.document.write(html);
        popup.document.close();
      })
      .catch(error => {
        console.error("Error fetching LinkedIn auth page:", error);
        popup.close();
        toast.error("Failed to load LinkedIn authentication page");
        resolve(false);
      });

    // Set up message event listener for communication
    const messageHandler = (event: MessageEvent) => {
      // Check origin for security
      if (event.origin !== "https://linkedai-backend.vercel.app") return;
      
      try {
        if (event.data?.type === "linkedin-auth-success") {
          // Store user data from the event
          const userData = event.data.user || {
            name: "LinkedIn User",
            position: "Professional",
            profileImage: "https://via.placeholder.com/150"
          };
          
          // Save the authentication state and user data
          localStorage.setItem("linkedinConnected", "true");
          localStorage.setItem("linkedinUser", JSON.stringify({
            ...userData,
            connectedAt: new Date().toISOString()
          }));
          
          // Close the popup
          popup.close();
          window.removeEventListener("message", messageHandler);
          
          toast.success("LinkedIn account connected successfully!");
          resolve(true);
        } else if (event.data?.type === "linkedin-auth-error") {
          popup.close();
          window.removeEventListener("message", messageHandler);
          toast.error("Failed to connect to LinkedIn. Please try again.");
          resolve(false);
        }
      } catch (error) {
        console.error("Error processing auth message:", error);
        resolve(false);
      }
    };

    window.addEventListener("message", messageHandler);

    // Handle popup close
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", messageHandler);
        // Only show error if not already authenticated (prevents error when popup closes after successful auth)
        if (!localStorage.getItem("linkedinConnected")) {
          toast.error("LinkedIn authentication was canceled");
          resolve(false);
        }
      }
    }, 500);
  });
};

export const connectToLinkedIn = async (): Promise<boolean> => {
  console.log("Connecting to LinkedIn...");
  
  try {
    // Open the LinkedIn auth popup
    return await openLinkedInAuthPopup();
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
