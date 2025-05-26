
import { Post } from "@/types";
import { toast } from "sonner";
import { savePostWithImage, updatePost as updatePostAPI, deletePost as deletePostAPI } from "@/services/postService";

export const usePostOperations = (
  posts: Post[],
  setPosts: (posts: Post[] | ((prevPosts: Post[]) => Post[])) => void,
  getUserId: () => string
) => {
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
      const savedPost = await savePostWithImage(post.content, getUserId(), post.imageUrl);
      
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id ? { 
            ...post, 
            status: "approved",
            id: savedPost._id || savedPost.id || post.id // Use server ID if available
          } : post
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

    console.log('Updating post:', id, 'with data:', updatedPost);

    try {
      // Update local state immediately for UI responsiveness
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id ? { ...post, ...updatedPost } : post
        )
      );

      // Only call API if post is approved (exists on server)
      if (post.status === "approved") {
        const updates: any = {};
        if (updatedPost.content !== undefined) updates.description = updatedPost.content;
        if (updatedPost.imageUrl !== undefined) updates.imageUrl = updatedPost.imageUrl;
        if (updatedPost.scheduledFor !== undefined) updates.scheduleTime = updatedPost.scheduledFor.toISOString();
        if (updatedPost.tags !== undefined) updates.tags = updatedPost.tags;
        
        console.log('Sending API update for approved post:', id, 'updates:', updates);
        
        const serverPost = await updatePostAPI(id, getUserId(), updates);
        
        console.log('Server response:', serverPost);
        
        // Update with server response if available
        if (serverPost) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === id ? { 
                ...post, 
                ...updatedPost,
                id: serverPost._id || serverPost.id || post.id
              } : post
            )
          );
        }
      }
      
      toast.success("Post updated");
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error("Failed to update post on server");
      
      // Revert local changes on error
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === id ? post : p
        )
      );
    }
  };

  const deletePost = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    try {
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
        
        const updates = {
          scheduleTime: null
        };
        
        await updatePostAPI(id, getUserId(), updates);
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
    addPost,
    addPosts,
    approvePost,
    rejectPost,
    updatePost,
    deletePost,
    schedulePost,
    removeSchedule,
  };
};
