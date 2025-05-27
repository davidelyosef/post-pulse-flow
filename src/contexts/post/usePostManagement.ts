
import { Post } from "@/types";
import { toast } from "sonner";
import { updatePost as updatePostAPI, deletePost as deletePostAPI } from "@/services/postService";
import { publishPost as publishToLinkedIn } from "@/services/linkedinService";

export const usePostManagement = (
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

  const publishPost = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    console.log('Publishing post:', id, 'with content:', post.content);

    try {
      // Publish to LinkedIn with postId
      const success = await publishToLinkedIn(post.content, post.imageUrl, id);
      
      if (success) {
        // Update local state to mark as published
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === id ? { 
              ...post, 
              status: "published" as const,
              publishedAt: new Date()
            } : post
          )
        );
        toast.success("Post published to LinkedIn");
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      toast.error("Failed to publish post");
    }
  };

  return {
    addPost,
    addPosts,
    updatePost,
    deletePost,
    publishPost,
  };
};
