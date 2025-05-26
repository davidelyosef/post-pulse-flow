
import { Post } from "@/types";

export interface PostContextType {
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
  updatePostImage: (id: string, imageUrl: string) => void;
  loadUserPosts: () => Promise<void>;
  isLoading: boolean;
  isGeneratingImage: boolean;
}
