
import { Post } from "@/types";
import { toast } from "sonner";
import { updatePost as updatePostAPI, removeSchedule as removeScheduleAPI } from "@/services/postService";

export const usePostScheduling = (
  posts: Post[],
  setPosts: (posts: Post[] | ((prevPosts: Post[]) => Post[])) => void,
  getUserId: () => string
) => {
  const schedulePost = async (id: string, date: Date) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    try {
      // Update local state immediately
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id ? { ...post, scheduledFor: date } : post
        )
      );

      // If post is approved (exists on server), update the schedule time on backend
      if (post.status === "approved") {
        console.log('Updating schedule time on server for post:', id, 'date:', date.toISOString());
        
        const updates = {
          scheduleTime: date.toISOString()
        };
        
        await updatePostAPI(id, getUserId(), updates);
        console.log('Schedule time updated on server successfully');
      }

      toast.success("Post scheduled");
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast.error("Failed to update schedule on server");
      
      // Revert local changes on error
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === id ? post : p
        )
      );
    }
  };

  const removeSchedule = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    try {
      // Update local state immediately
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id ? { ...post, scheduledFor: undefined } : post
        )
      );

      // If post is approved (exists on server), remove the schedule time on backend
      if (post.status === "approved") {
        console.log('Removing schedule time on server for post:', id);
        
        await removeScheduleAPI(id, getUserId());
        console.log('Schedule time removed on server successfully');
      }

      toast.success("Schedule removed");
    } catch (error) {
      console.error('Error removing schedule:', error);
      toast.error("Failed to remove schedule on server");
      
      // Revert local changes on error
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === id ? post : p
        )
      );
    }
  };

  return {
    schedulePost,
    removeSchedule,
  };
};
