import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Post } from "@/types";
import { toast } from "sonner";
import { generateImage as generateImageService } from "@/services/linkedinService";
import { savePostWithImage, getUserPosts, updatePost as updatePostAPI, deletePost as deletePostAPI } from "@/services/postService";
import { useUser } from "./UserContext";
import { generateImageFromPrompt } from "@/services/openAIService";

interface PostContextType {
  posts: Post[];
  pendingPosts: Post[];
  approvedPosts: Post[];
  rejectedPosts: Post[];
  addPost: (post: Post) => void;
  addPosts: (posts: Post[]) => void;
  approvePost: (id: string) => Promise<void>;
  rejectPost: (id: string) => void;
  updatePost: (id: string, updatedPost: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  schedulePost: (id: string, date: Date) => void;
  generateImagePrompts: (id: string) => Promise<string[]>;
  selectImagePrompt: (id: string, prompt: string) => void;
  generateImage: (id: string, prompt: string) => Promise<string>;
  regenerateImage: (id: string, prompt: string) => Promise<string>;
  loadUserPosts: () => Promise<void>;
  isLoading: boolean;
  isGeneratingImage: boolean;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { user, getUserId } = useUser();

  // Load user posts when user changes
  useEffect(() => {
    if (user?.id && user.id !== 'default-user-id') {
      loadUserPosts();
    }
  }, [user?.id]);

  // Filter posts by status
  const pendingPosts = posts.filter((post) => post.status === "pending");
  const approvedPosts = posts.filter((post) => post.status === "approved");
  const rejectedPosts = posts.filter((post) => post.status === "rejected");

  const loadUserPosts = async () => {
    if (!user?.id || user.id === 'default-user-id') return;
    
    setIsLoading(true);
    try {
      console.log('Loading posts for user:', user.id);
      const serverPosts = await getUserPosts(user.id);
      
      // Convert server posts to client Post format
      const clientPosts: Post[] = serverPosts.map((serverPost: any) => ({
        id: serverPost._id,
        content: serverPost.data,
        tags: [],
        createdAt: new Date(serverPost.createdAt),
        status: "approved", // Server posts are considered approved
        imageUrl: serverPost.imageUrl,
        scheduledFor: serverPost.scheduleTime ? new Date(serverPost.scheduleTime) : undefined,
      }));
      
      setPosts(clientPosts);
      console.log('Loaded and converted posts:', clientPosts);
    } catch (error) {
      console.error('Error loading user posts:', error);
      toast.error('Failed to load your posts');
    } finally {
      setIsLoading(false);
    }
  };

  const addPost = (post: Post) => {
    setPosts((prevPosts) => [...prevPosts, post]);
  };

  const addPosts = (newPosts: Post[]) => {
    setPosts((prevPosts) => [...prevPosts, ...newPosts]);
  };

  const approvePost = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    try {
      // Save to server when approving
      await savePostWithImage(post.content, getUserId(), post.imageUrl);
      
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id ? { ...post, status: "approved" } : post
        )
      );
      toast.success("Post approved and saved");
    } catch (error) {
      console.error('Error approving post:', error);
      toast.error("Failed to save post to server");
    }
  };

  const rejectPost = (id: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, status: "rejected" } : post
      )
    );
    toast.info("Post rejected");
  };

  const updatePost = async (id: string, updatedPost: Partial<Post>) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    try {
      // If the post is already approved (saved on server), update it there
      if (post.status === "approved") {
        const updates: any = {};
        if (updatedPost.content) updates.description = updatedPost.content;
        if (updatedPost.imageUrl) updates.imageUrl = updatedPost.imageUrl;
        if (updatedPost.scheduledFor) updates.scheduleTime = updatedPost.scheduledFor.toISOString();
        
        await updatePostAPI(id, getUserId(), updates);
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id ? { ...post, ...updatedPost } : post
        )
      );
      toast.success("Post updated");
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error("Failed to update post on server");
    }
  };

  const deletePost = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    try {
      // If the post is approved (saved on server), delete it there
      if (post.status === "approved") {
        await deletePostAPI(id, getUserId());
      }

      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
      toast.info("Post deleted");
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error("Failed to delete post from server");
    }
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

  // Updated to use the correct API endpoint for image generation
  const generateImage = async (id: string, prompt: string): Promise<string> => {
    setIsGeneratingImage(true);
    
    try {
      // Call the image generation API
      const imageUrl = await generateImageFromPrompt(prompt, getUserId());
      
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
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Regenerate image using the same API endpoint
  const regenerateImage = async (id: string, prompt: string): Promise<string> => {
    return generateImage(id, prompt);
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
    regenerateImage,
    loadUserPosts,
    isLoading,
    isGeneratingImage,
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
