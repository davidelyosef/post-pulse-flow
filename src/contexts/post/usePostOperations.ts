
import { Post } from "@/types";
import { usePostApproval } from "./usePostApproval";
import { usePostManagement } from "./usePostManagement";
import { usePostScheduling } from "./usePostScheduling";

export const usePostOperations = (
  posts: Post[],
  setPosts: (posts: Post[] | ((prevPosts: Post[]) => Post[])) => void,
  getUserId: () => string
) => {
  const { approvePost, rejectPost } = usePostApproval(posts, setPosts, getUserId);
  const { addPost, addPosts, updatePost, deletePost } = usePostManagement(posts, setPosts, getUserId);
  const { schedulePost, removeSchedule } = usePostScheduling(posts, setPosts, getUserId);

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
