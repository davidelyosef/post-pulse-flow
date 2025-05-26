
import { Post } from "@/types";
import { toast } from "sonner";
import { savePostWithImage } from "@/services/postService";

export const usePostApproval = (
  posts: Post[],
  setPosts: (posts: Post[] | ((prevPosts: Post[]) => Post[])) => void,
  getUserId: () => string
) => {
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

  return {
    approvePost,
    rejectPost,
  };
};
