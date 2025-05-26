
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
        if (updatedPost.content) updates.description = updatedPost.content;
        if (updatedPost.imageUrl) updates.imageUrl = updatedPost.imageUrl;
        if (updatedPost.scheduledFor) updates.scheduleTime = updatedPost.scheduledFor.toISOString();
        if (updatedPost.tags) updates.tags = updatedPost.tags;
        
        const serverPost = await updatePostAPI(id, getUserId(), updates);
        
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

  const schedulePost = (id: string, date: Date) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, scheduledFor: date } : post
      )
    );
    toast.success("Post scheduled");
  };

  return {
    addPost,
    addPosts,
    approvePost,
    rejectPost,
    updatePost,
    deletePost,
    schedulePost,
  };
};
