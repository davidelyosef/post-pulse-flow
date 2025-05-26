
// This is a service for generating LinkedIn posts using the external API

import { Post } from "@/types";

const API_BASE_URL = "https://34.226.170.38:3000/api/generate";

const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const generatePosts = async (
  count: number = 5,
  topic?: string,
  tone?: string,
  style?: string,
  generateImage: boolean = false,
  imageModel: string = "dalle3"
): Promise<Post[]> => {
  console.log(`Generating ${count} posts about "${topic}" with tone "${tone}" and style "${style}"`);

  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: tone,
        description: topic,
        numberOfRequests: count,
        generateImage,
        imageModel,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("API response data:", data);

    if (!data.success || !data.results) {
      throw new Error("Invalid response format from API");
    }

    const posts: Post[] = data.results.map((item: any) => {
      const content = item.content || "";
      
      if (!content.trim()) {
        throw new Error("Empty post content received");
      }

      return {
        id: generateUniqueId(),
        content: content,
        tags: [],
        createdAt: new Date(),
        status: "pending",
        tone: tone || undefined,
        style: style || undefined,
        imageUrl: item.imageUrl || undefined,
        imagePrompt: item.imagePrompt || undefined,
      };
    });

    console.log("Generated posts:", posts);

    if (posts.length === 0) {
      throw new Error("No valid posts were generated");
    }

    return posts;
  } catch (error) {
    console.error("Error generating posts:", error);
    throw error;
  }
};

export const generateImageFromPrompt = async (
  prompt: string,
  userId: string,
  model: string = "dalle3"
): Promise<string> => {
  console.log("Generating image for prompt:", prompt);

  try {
    const response = await fetch(`${API_BASE_URL}/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        userId,
        model,
      }),
    });

    if (!response.ok) {
      throw new Error(`Image generation failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Image generation response:", data);

    if (!data.success || !data.imageUrl) {
      throw new Error("Failed to generate image");
    }

    return data.imageUrl;
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
};

export const savePostWithImage = async (
  description: string,
  userId: string,
  imageUrl?: string
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/saveimage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        userId,
        imageUrl: imageUrl || false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Save post failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to save post");
    }

    return data.post;
  } catch (error) {
    console.error("Save post error:", error);
    throw error;
  }
};

export const getUserPosts = async (userId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Get user posts failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to get user posts");
    }

    return data.posts;
  } catch (error) {
    console.error("Get user posts error:", error);
    throw error;
  }
};

export const updatePost = async (
  postId: string,
  userId: string,
  updates: {
    description?: string;
    imageUrl?: string;
    scheduleTime?: string;
  }
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/update/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...updates,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Update post failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to update post");
    }

    return data.post;
  } catch (error) {
    console.error("Update post error:", error);
    throw error;
  }
};

export const deletePost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete/${postId}?userId=${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Delete post failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to delete post");
    }

    return true;
  } catch (error) {
    console.error("Delete post error:", error);
    throw error;
  }
};

export const generateImagePrompts = async (postContent: string): Promise<string[]> => {
  // Create some contextually relevant image prompts based on common LinkedIn themes
  const basePrompts = [
    "A professional looking person writing on a laptop with a thoughtful expression",
    "Abstract visualization of networking connections with blue and white nodes",
    "A minimalist illustration showing growth and progress through simple graphs",
    "A person standing confidently at a podium presenting to an audience",
    "A clean, modern workspace with productivity tools and technology",
  ];

  return basePrompts;
};

export const generateImage = async (prompt: string): Promise<string> => {
  // For demo purposes, return a placeholder image
  const placeholderImages = [
    "https://via.placeholder.com/800x450/0077B5/ffffff?text=Professional+LinkedIn+Post",
    "https://via.placeholder.com/800x450/2867B2/ffffff?text=Career+Development",
    "https://via.placeholder.com/800x450/0A66C2/ffffff?text=Networking+Connections",
    "https://via.placeholder.com/800x450/0073B1/ffffff?text=Leadership+Insights",
    "https://via.placeholder.com/800x450/004182/ffffff?text=Industry+Trends",
  ];

  const randomIndex = Math.floor(Math.random() * placeholderImages.length);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(placeholderImages[randomIndex]);
    }, 2000);
  });
};
