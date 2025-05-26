
import { useState } from "react";
import { Post } from "@/types";
import { toast } from "sonner";
import { getUserPosts } from "@/services/postService";

export const usePostLoader = (
  setPosts: (posts: Post[] | ((prevPosts: Post[]) => Post[])) => void,
  userId?: string
) => {
  const [isLoading, setIsLoading] = useState(false);

  const loadUserPosts = async () => {
    if (!userId || userId === 'default-user-id') return;
    
    setIsLoading(true);
    try {
      console.log('Loading posts for user:', userId);
      const serverPosts = await getUserPosts(userId);
      
      const clientPosts: Post[] = serverPosts.map((serverPost: any) => ({
        id: serverPost._id,
        content: serverPost.data,
        tags: [],
        createdAt: new Date(serverPost.createdAt),
        status: "approved",
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

  return {
    isLoading,
    loadUserPosts,
  };
};
