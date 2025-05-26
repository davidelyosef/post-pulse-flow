
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post/PostCard";
import { Loader2, Save, Share2 } from "lucide-react";
import { Post } from "@/types";
import { publishPost, isLinkedInConnected } from "@/services/linkedinService";
import { updatePost as updatePostAPI } from "@/services/postService";
import { usePostContext } from "@/contexts/PostContext";
import { toast } from "sonner";

interface PostViewDialogProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (postId: string) => void;
  getUserId: () => string;
}

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const PostViewDialog = ({
  post,
  isOpen,
  onClose,
  onDelete,
  getUserId,
}: PostViewDialogProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | undefined>(undefined);
  const [hasImageChanged, setHasImageChanged] = useState(false);
  const { updatePost, posts } = usePostContext();

  // Get the current post from context to ensure we have the latest version
  const currentPost = posts.find(p => p.id === post?.id) || post;

  console.log("PostViewDialog: Rendering with post:", post?.id, "currentPost imageUrl:", currentPost?.imageUrl);

  // Track the original image URL when dialog opens
  useEffect(() => {
    if (isOpen && currentPost) {
      console.log("PostViewDialog: Dialog opened, setting original image URL:", currentPost.imageUrl);
      setOriginalImageUrl(currentPost.imageUrl);
      setHasImageChanged(false);
    }
  }, [isOpen, currentPost?.id]);

  // Check if image has changed whenever currentPost.imageUrl changes
  useEffect(() => {
    if (currentPost && originalImageUrl !== undefined) {
      const hasChanged = currentPost.imageUrl !== originalImageUrl;
      console.log("PostViewDialog: Image change check - original:", originalImageUrl, "current:", currentPost.imageUrl, "hasChanged:", hasChanged);
      setHasImageChanged(hasChanged);
    }
  }, [currentPost?.imageUrl, originalImageUrl]);

  const handlePublishNow = async () => {
    if (!currentPost) return;
    
    if (!isLinkedInConnected()) {
      toast.error("Please connect to LinkedIn before publishing");
      onClose();
      return;
    }
    
    setIsPublishing(true);
    try {
      const success = await publishPost(currentPost.content, currentPost.imageUrl);
      if (success) {
        onClose();
        toast.success("Post published to LinkedIn successfully!");
      }
    } catch (error) {
      toast.error("Failed to publish post");
      console.error("Error publishing post:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSavePost = async () => {
    if (!currentPost) return;
    
    // Only check for valid ObjectId if the post has approved status (exists on server)
    if (currentPost.status === "approved" && !isValidObjectId(currentPost.id)) {
      toast.error("Cannot update post: Invalid post ID format");
      console.error("Invalid ObjectId format:", currentPost.id);
      return;
    }
    
    setIsSaving(true);
    try {
      const updates: any = {
        description: currentPost.content
      };
      
      // Only include imageUrl if it has actually changed or if it's a new post with an image
      if (hasImageChanged || (currentPost.status === "pending" && currentPost.imageUrl)) {
        updates.imageUrl = currentPost.imageUrl;
      }
      
      let savedPost = currentPost;
      
      // Only call API if post is approved (exists on server) or if it's a new post that needs saving
      if (currentPost.status === "approved") {
        savedPost = await updatePostAPI(currentPost.id, getUserId(), updates);
      } else if (currentPost.status === "pending") {
        // For new posts, we need to save them and get the server ID
        const { savePostWithImage } = await import("@/services/postService");
        const serverResponse = await savePostWithImage(currentPost.content, getUserId(), currentPost.imageUrl);
        
        // Update the post in context with the new server ID and approved status
        const serverId = serverResponse.id || currentPost.id;
        updatePost(currentPost.id, {
          id: serverId,
          status: "approved",
          imageUrl: currentPost.imageUrl
        });
      }
      
      // Reset the change tracking after successful save
      setOriginalImageUrl(currentPost.imageUrl);
      setHasImageChanged(false);
      
      toast.success("Post saved successfully!");
    } catch (error) {
      toast.error("Failed to save post");
      console.error("Error saving post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageRegenerated = (newImageUrl: string) => {
    console.log("PostViewDialog: Image regenerated callback with URL:", newImageUrl);
    
    // Update the post in context with the new image
    if (currentPost) {
      console.log("PostViewDialog: Updating post in context with new image URL");
      updatePost(currentPost.id, { imageUrl: newImageUrl });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Post Details</DialogTitle>
        </DialogHeader>
        
        {currentPost && (
          <div className="py-4">
            <PostCard 
              post={currentPost} 
              showActions={false}
              onImageRegenerated={handleImageRegenerated}
            />
          </div>
        )}
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2"
            onClick={handleSavePost}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Post
              </>
            )}
          </Button>
          <Button
            className="w-full sm:w-auto gap-2"
            onClick={handlePublishNow}
            disabled={isPublishing || !isLinkedInConnected()}
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Publish Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
