
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Post } from "@/types";
import { useUser } from "./UserContext";
import { PostContextType } from "./post/types";
import { useImageGeneration } from "./post/useImageGeneration";
import { usePostOperations } from "./post/usePostOperations";
import { usePostLoader } from "./post/usePostLoader";

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user, getUserId } = useUser();

  // Custom hooks for different functionalities
  const { isLoading, loadUserPosts } = usePostLoader(setPosts, user?.id);
  const { isGeneratingImage, generateImagePrompts, selectImagePrompt, generateImage, regenerateImage, updatePostImage } = useImageGeneration(posts, setPosts, getUserId);
  const { addPost, addPosts, approvePost, rejectPost, updatePost, deletePost, schedulePost } = usePostOperations(posts, setPosts, getUserId);

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
    updatePostImage,
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
