
import { toast } from "sonner";

export const connectToLinkedIn = async (): Promise<boolean> => {
  window.location.href = "https://34.226.170.38:3000/api/auth/linkedin";
  return;
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

// New function to generate an image based on a prompt
export const generateImage = async (prompt: string, content: string): Promise<string | null> => {
  try {
    console.log("Generating image with prompt:", prompt);

    const response = await fetch("https://34.226.170.38:3000/api/generate/saveimage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJxo2NFiYcR35GzCk5T3nxA7rGlSsXvIfJwg&s",
        description: content,
        userId: "682c65e996c62a2bca89a8ba",
      }),
    });

    if (!response.ok) {
      throw new Error(`Image generation failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Image generation response:", data);

    // Return the URL of the generated image
    return data.imageUrl || data.url || null;
  } catch (error) {
    console.error("Image generation error:", error);
    toast.error("Failed to generate image. Please try again.");
    return null;
  }
};

export const publishPost = async (content: string, imageUrl?: string): Promise<boolean> => {
  // Check if connected first
  if (!isLinkedInConnected()) {
    toast.error("Please connect to LinkedIn before publishing");
    return false;
  }

  console.log("Publishing to LinkedIn:", { content, imageUrl });

  try {
    // Get user data from localStorage
    const userData = getLinkedInUser();

    if (!userData) {
      toast.error("LinkedIn user data not found. Please reconnect your account.");
      return false;
    }

    // Prepare request body according to the backend API
    const requestBody = {
      content: content,
      imageUrl: imageUrl || "",
      visibility: "PUBLIC",
      user_id: userData.id || userData.userId || userData._id?.$oid || userData._id,
    };

    console.log("Sending LinkedIn post request:", requestBody);

    // Make POST request to the correct endpoint
    const response = await fetch("https://34.226.170.38:3000/api/linkedin/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("LinkedIn publishing error:", response.status, errorData);
      throw new Error(`Failed to publish with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("LinkedIn publish response:", data);

    if (data.success) {
      toast.success("Post published to LinkedIn successfully!");
      return true;
    } else {
      throw new Error(data.message || "Failed to publish post");
    }
  } catch (error) {
    console.error("LinkedIn publishing error:", error);
    toast.error("Failed to publish to LinkedIn. Please try again.");
    return false;
  }
};

export const schedulePost = async (content: string, scheduledTime: Date, imageUrl?: string): Promise<boolean> => {
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
