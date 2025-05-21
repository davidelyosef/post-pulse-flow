
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Post } from "@/types";
import { toast } from "sonner";
import { generateImage as generateImageService } from "@/services/linkedinService";

interface PostContextType {
  posts: Post[];
  pendingPosts: Post[];
  approvedPosts: Post[];
  rejectedPosts: Post[];
  addPost: (post: Post) => void;
  addPosts: (posts: Post[]) => void;
  approvePost: (id: string) => void;
  rejectPost: (id: string) => void;
  updatePost: (id: string, updatedPost: Partial<Post>) => void;
  deletePost: (id: string) => void;
  schedulePost: (id: string, date: Date) => void;
  generateImagePrompts: (id: string) => Promise<string[]>;
  selectImagePrompt: (id: string, prompt: string) => void;
  generateImage: (id: string, prompt: string) => Promise<string>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  // Filter posts by status
  const pendingPosts = posts.filter((post) => post.status === "pending");
  const approvedPosts = posts.filter((post) => post.status === "approved");
  const rejectedPosts = posts.filter((post) => post.status === "rejected");

  const addPost = (post: Post) => {
    setPosts((prevPosts) => [...prevPosts, post]);
  };

  const addPosts = (newPosts: Post[]) => {
    setPosts((prevPosts) => [...prevPosts, ...newPosts]);
  };

  const approvePost = (id: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, status: "approved" } : post
      )
    );
    toast.success("Post approved");
  };

  const rejectPost = (id: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, status: "rejected" } : post
      )
    );
    toast.info("Post rejected");
  };

  const updatePost = (id: string, updatedPost: Partial<Post>) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, ...updatedPost } : post
      )
    );
    toast.success("Post updated");
  };

  const deletePost = (id: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    toast.info("Post deleted");
  };

  const schedulePost = (id: string, date: Date) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, scheduledFor: date } : post
      )
    );
    toast.success("Post scheduled");
  };

  // Mock function that would call an API to generate image prompts
  const generateImagePrompts = async (id: string): Promise<string[]> => {
    // This would be an API call to OpenAI in a real implementation
    const post = posts.find((p) => p.id === id);
    if (!post) return [];
    
    // Mock response
    const mockPrompts = [
      `Professional illustration of a LinkedIn post about ${post.subject || "business"}`,
      `Modern minimalist graphic related to ${post.tags.join(", ")}`,
      `Clean business visual with blue tones representing ${post.subject || "professional growth"}`,
      `Metaphorical image showing concepts of ${post.tags.join(" and ")}`,
      `Inspirational quote layout for a post about ${post.subject || "career development"}`
    ];
    
    // Update the post with image prompts
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, imagePrompts: mockPrompts } : post
      )
    );
    
    return mockPrompts;
  };

  const selectImagePrompt = (id: string, prompt: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, selectedImagePrompt: prompt } : post
      )
    );
  };

  // Updated to use the real API
  const generateImage = async (id: string, prompt: string): Promise<string> => {
    const post = posts.find((p) => p.id === id);
    if (!post) return "";
    
    try {
      // Call the real API service to generate an image
      const imageUrl = await generateImageService(prompt, post.content);
      
      if (imageUrl) {
        // Update the post with the image URL
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === id ? { ...p, imageUrl } : p
          )
        );
        
        return imageUrl;
      } else {
        // If no image URL was returned, use fallback
        const fallbackUrl = "https://via.placeholder.com/800x450/0077B5/ffffff?text=LinkedIn+Image";
        
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === id ? { ...p, imageUrl: fallbackUrl } : p
          )
        );
        
        return fallbackUrl;
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image. Using placeholder instead.");
      
      // Fallback to placeholder
      const fallbackUrl = "https://via.placeholder.com/800x450/0077B5/ffffff?text=LinkedIn+Image";
      
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === id ? { ...p, imageUrl: fallbackUrl } : p
        )
      );
      
      return fallbackUrl;
    }
  };

  const value = {
    posts,
    pendingPosts,
    approvedPosts,
    rejectedPosts,
    addPost,
    addPosts,
    approvePost,
    rejectPost,
    updatePost,
    deletePost,
    schedulePost,
    generateImagePrompts,
    selectImagePrompt,
    generateImage,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};

export const usePostContext = (): PostContextType => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePostContext must be used within a PostProvider");
  }
  return context;
};
