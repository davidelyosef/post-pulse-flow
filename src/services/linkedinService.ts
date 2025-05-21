
import { toast } from "sonner";

export const connectToLinkedIn = async (): Promise<boolean> => {
  // In a real app, this would redirect to LinkedIn OAuth flow
  // Here we're implementing a more realistic mock with proper error handling
  
  console.log("Connecting to LinkedIn...");
  
  try {
    // Store connection state in localStorage first
    localStorage.setItem("linkedinConnected", "true");
    localStorage.setItem("linkedinUser", JSON.stringify({
      userId: "",
      user_id: "",
      displayName: "Demo User",
      position: "Professional at Company",
      profileUrl: "https://thispersondoesnotexist.com/",
      email: "demo@demo.com",
      linkedinId: "",
      accessToken: "",
      connectedAt: new Date().toISOString()
    }));

    const urlParams = new URLSearchParams(window.location.search);
    console.log("urlParams", urlParams);

    if (urlParams.get("success") !== "true") {
      window.location.href = "https://34.226.170.38:3000/api/auth/linkedin";
    }
    
    return true;
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

// New function to get all posts for a user
export const getUserPosts = async (userId: string): Promise<any> => {
  try {
    console.log("Fetching posts for user:", userId);
    
    const response = await fetch(`https://34.226.170.38:3000/api/generate/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user posts with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("User posts response:", data);
    
    return data;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    toast.error("Failed to fetch user posts. Please try again.");
    return { success: false, count: 0, posts: [] };
  }
};

// Function to update a post via API
export const updatePostAPI = async (
  postId: string,
  content: string,
  userId: string,
  imageUrl?: string,
  scheduledTime?: Date
): Promise<boolean> => {
  try {
    console.log("Updating post:", postId);
    
    const requestBody = {
      description: content,
      userId,
      imageUrl: imageUrl || "",
      scheduleTime: scheduledTime ? scheduledTime.toISOString() : new Date().toISOString()
    };
    
    const response = await fetch(`https://34.226.170.38:3000/api/generate/update/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update post with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Update post response:", data);
    
    toast.success("Post updated successfully!");
    return true;
  } catch (error) {
    console.error("Error updating post:", error);
    toast.error("Failed to update post. Please try again.");
    return false;
  }
};

// Function to delete a post via API
export const deletePostAPI = async (postId: string, userId: string): Promise<boolean> => {
  try {
    console.log("Deleting post:", postId);
    
    const response = await fetch(`https://34.226.170.38:3000/api/generate/delete/${postId}?userId=${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete post with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Delete post response:", data);
    
    toast.success("Post deleted successfully!");
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    toast.error("Failed to delete post. Please try again.");
    return false;
  }
};

// Function to save an approved post to the database
export const saveApprovedPostAPI = async (
  imageUrl: string,
  description: string,
  userId: string
): Promise<{ success: boolean; post?: any }> => {
  try {
    console.log("Saving approved post:", { imageUrl, description, userId });
    
    const response = await fetch("https://34.226.170.38:3000/api/generate/saveimage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
        description,
        userId
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save post with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Save post response:", data);
    
    return {
      success: true,
      post: data.post
    };
  } catch (error) {
    console.error("Error saving approved post:", error);
    toast.error("Failed to save post. Please try again.");
    return { success: false };
  }
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
        userId: "682c65e996c62a2bca89a8ba"
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
    // Get user data from localStorage
    const userData = getLinkedInUser();
    
    if (!userData) {
      toast.error("LinkedIn user data not found. Please reconnect your account.");
      return false;
    }
    
    // Prepare request body
    const requestBody = {
      content: content,
      visibility: "PUBLIC",
      user_id: userData.userId || userData._id.$oid,
      data: "", // Optional additional data
      imageUrl: imageUrl || "",
      userId: userData.userId || userData._id.$oid,
      scheduleTime: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    console.log("Sending LinkedIn post request:", requestBody);
    
    // Make POST request to publish endpoint
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
    
    toast.success("Post published to LinkedIn successfully!");
    return true;
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
