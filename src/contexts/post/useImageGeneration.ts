
import { useState } from "react";
import { Post } from "@/types";
import { toast } from "sonner";
import { generateImageFromPrompt } from "@/services/openAIService";

export const useImageGeneration = (
  posts: Post[],
  setPosts: (posts: Post[] | ((prevPosts: Post[]) => Post[])) => void,
  getUserId: () => string
) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const generateImagePrompts = async (id: string): Promise<string[]> => {
    const post = posts.find((p) => p.id === id);
    if (!post) return [];
    
    const mockPrompts = [
      `Professional illustration of a LinkedIn post about ${post.subject || "business"}`,
      `Modern minimalist graphic related to ${post.tags.join(", ")}`,
      `Clean business visual with blue tones representing ${post.subject || "professional growth"}`,
      `Metaphorical image showing concepts of ${post.tags.join(" and ")}`,
      `Inspirational quote layout for a post about ${post.subject || "career development"}`
    ];
    
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, imagePrompts: mockPrompts } : post
      )
    );
    
    return mockPrompts;
  };

  const selectImagePrompt = (id: string, prompt: string) => {
    console.log("useImageGeneration: Selecting prompt for post", id, "prompt:", prompt);
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, selectedImagePrompt: prompt } : post
      )
    );
  };

  const generateImage = async (id: string, prompt: string): Promise<string> => {
    console.log("useImageGeneration: Generating image for post", id, "with prompt:", prompt);
    setIsGeneratingImage(true);
    
    try {
      const imageUrl = await generateImageFromPrompt(prompt, getUserId());
      console.log("useImageGeneration: Received image URL:", imageUrl);
      
      if (imageUrl) {
        // Update the post with the new image URL immediately
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === id ? { ...p, imageUrl } : p
          )
        );
        
        console.log("useImageGeneration: Updated post", id, "with imageUrl:", imageUrl);
        return imageUrl;
      } else {
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
      
      const fallbackUrl = "https://via.placeholder.com/800x450/0077B5/ffffff?text=LinkedIn+Image";
      
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === id ? { ...p, imageUrl: fallbackUrl } : p
        )
      );
      
      return fallbackUrl;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const regenerateImage = async (id: string, prompt: string): Promise<string> => {
    return generateImage(id, prompt);
  };

  // New function to update image URL directly for pending posts
  const updatePostImage = (id: string, imageUrl: string) => {
    console.log("useImageGeneration: Updating post", id, "with direct imageUrl:", imageUrl);
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === id ? { ...p, imageUrl } : p
      )
    );
  };

  return {
    isGeneratingImage,
    generateImagePrompts,
    selectImagePrompt,
    generateImage,
    regenerateImage,
    updatePostImage,
  };
};
