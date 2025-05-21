import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Post } from "@/types";
import { toast } from "sonner";
import { 
  generateImage as generateImageService, 
  saveApprovedPostAPI, 
  updatePostAPI, 
  deletePostAPI,
  getUserPosts, 
  getLinkedInUser, 
  isLinkedInConnected 
} from "@/services/linkedinService";

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
  fetchUserPosts: () => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  // Filter posts by status
  const pendingPosts = posts.filter((post) => post.status === "pending");
  const approvedPosts = posts.filter((post) => post.status === "approved");
  const rejectedPosts = posts.filter((post) => post.status === "rejected");
  
  // Fetch user posts when component mounts
  useEffect(() => {
    if (isLinkedInConnected()) {
      fetchUserPosts().catch(error => {
        console.error("Error in initial posts fetch:", error);
      });
    }
  }, []);

  const addPost = (post: Post) => {
    setPosts((prevPosts) => [...prevPosts, post]);
  };

  const addPosts = (newPosts: Post[]) => {
    setPosts((prevPosts) => [...prevPosts, ...newPosts]);
  };

  const approvePost = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    // First update local state to provide immediate feedback
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, status: "approved" } : post
      )
    );
    
    // Check if we have a LinkedIn connection
    if (isLinkedInConnected()) {
      const user = getLinkedInUser();
      if (user) {
        const userId = user.userId || user._id?.$oid || user.linkedinId || "";
        
        // Call the API to save the approved post
        const result = await saveApprovedPostAPI(
          post.imageUrl || "", 
          post.content,
          userId
        );
        
        // If successful and we got back updated post data, update our local post
        if (result.success && result.post) {
          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p.id === id ? { 
                ...p, 
                imageUrl: result.post.imageUrl || p.imageUrl,
                // Update any other fields returned from the API if needed
              } : p
            )
          );
        }
      }
    }
    
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

  const updatePost = async (id: string, updatedPost: Partial<Post>) => {
    // Update local state first
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, ...updatedPost } : post
      )
    );
    
    // Then call API to update post if connected to LinkedIn
    if (isLinkedInConnected()) {
      const user = getLinkedInUser();
      if (user) {
        const post = posts.find(p => p.id === id);
        if (post) {
          const userId = user.userId || user._id?.$oid || user.linkedinId || "";
          await updatePostAPI(
            id, 
            updatedPost.content || post.content, 
            userId,
            updatedPost.imageUrl || post.imageUrl,
            updatedPost.scheduledFor || post.scheduledFor
          );
        }
      }
    }
    
    toast.success("Post updated");
  };

  const deletePost = async (id: string) => {
    // If connected to LinkedIn, call API to delete post
    if (isLinkedInConnected()) {
      const user = getLinkedInUser();
      if (user) {
        const userId = user.userId || user._id?.$oid || user.linkedinId || "";
        await deletePostAPI(id, userId);
      }
    }
    
    // Update local state after API call (regardless of result)
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    toast.info("Post deleted");
  };

  const schedulePost = async (id: string, date: Date) => {
    // Update local state first
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, scheduledFor: date } : post
      )
    );
    
    // Call API to update post with new schedule time if connected
    if (isLinkedInConnected()) {
      const user = getLinkedInUser();
      if (user) {
        const post = posts.find(p => p.id === id);
        if (post) {
          const userId = user.userId || user._id?.$oid || user.linkedinId || "";
          await updatePostAPI(
            id, 
            post.content, 
            userId,
            post.imageUrl,
            date
          );
        }
      }
    }
    
    toast.success("Post scheduled");
  };

  // Fetch user posts from API
  const fetchUserPosts = async (): Promise<void> => {
    if (!isLinkedInConnected()) return;
    
    const user = getLinkedInUser();
    if (!user) return;
    
    const userId = user.userId || user._id?.$oid || user.linkedinId || "";
    if (!userId) {
      console.error("No user ID found in LinkedIn user data");
      return;
    }
    
    try {
      const result = await getUserPosts(userId);
      
      if (result && result.success && Array.isArray(result.posts) && result.posts.length > 0) {
        // Transform API posts to our Post format
        const apiPosts = result.posts.map((apiPost: any) => ({
          id: apiPost._id || apiPost.id || String(Math.random()),
          content: apiPost.content || apiPost.description || "",
          createdAt: new Date(apiPost.createdAt || Date.now()),
          scheduledFor: apiPost.scheduleTime ? new Date(apiPost.scheduleTime) : undefined,
          tags: apiPost.tags || [],
          status: "approved",
          imageUrl: apiPost.imageUrl || "",
        }));
        
        // Add retrieved posts to state
        setPosts(prevPosts => {
          // Filter out duplicates by checking IDs
          const existingIds = new Set(prevPosts.map(post => post.id));
          const newPosts = apiPosts.filter(post => !existingIds.has(post.id));
          
          return [...prevPosts, ...newPosts];
        });
        
        if (apiPosts.length > 0) {
          toast.success(`Loaded ${apiPosts.length} posts from your account`);
        }
      } else {
        console.log("No posts found or invalid response format:", result);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
      // Don't show an error toast here since we already show one in getUserPosts
      // Just silently handle the error to prevent app crash
    }
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
    fetchUserPosts,
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
