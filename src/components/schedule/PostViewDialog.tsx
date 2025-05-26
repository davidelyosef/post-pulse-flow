
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post/PostCard";
import { Loader2, Save, Share2 } from "lucide-react";
import { Post } from "@/types";
import { publishPost, isLinkedInConnected } from "@/services/linkedinService";
import { updatePost as updatePostAPI } from "@/services/postService";
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
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);

  // Track the original image URL when dialog opens
  useEffect(() => {
    if (isOpen && post) {
      setOriginalImageUrl(post.imageUrl);
      setCurrentImageUrl(post.imageUrl);
      setHasImageChanged(false);
    }
  }, [isOpen, post?.id]);

  // Check if image has changed whenever post.imageUrl changes
  useEffect(() => {
    if (post && originalImageUrl !== undefined) {
      setHasImageChanged(post.imageUrl !== originalImageUrl);
      setCurrentImageUrl(post.imageUrl);
    }
  }, [post?.imageUrl, originalImageUrl]);

  const handlePublishNow = async () => {
    if (!post) return;
    
    if (!isLinkedInConnected()) {
      toast.error("Please connect to LinkedIn before publishing");
      onClose();
      return;
    }
    
    setIsPublishing(true);
    try {
      const success = await publishPost(post.content, currentImageUrl);
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
    if (!post) return;
    
    // Check if the post ID is a valid MongoDB ObjectId for server updates
    if (!isValidObjectId(post.id)) {
      toast.error("Cannot update post: Invalid post ID format");
      console.error("Invalid ObjectId format:", post.id);
      return;
    }
    
    setIsSaving(true);
    try {
      const updates: any = {
        description: post.content
      };
      
      // Only include imageUrl if it has actually changed
      if (hasImageChanged) {
        updates.imageUrl = currentImageUrl;
      }
      
      await updatePostAPI(post.id, getUserId(), updates);
      
      // Reset the change tracking after successful save
      setOriginalImageUrl(currentImageUrl);
      setHasImageChanged(false);
      
      toast.success("Post updated successfully!");
    } catch (error) {
      toast.error("Failed to update post");
      console.error("Error updating post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageRegenerated = (newImageUrl: string) => {
    // Update local state without automatically saving
    setCurrentImageUrl(newImageUrl);
    if (originalImageUrl !== undefined) {
      setHasImageChanged(newImageUrl !== originalImageUrl);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Post Details</DialogTitle>
        </DialogHeader>
        
        {post && (
          <div className="py-4">
            <PostCard 
              post={{...post, imageUrl: currentImageUrl}} 
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
            disabled={isSaving || !isValidObjectId(post?.id || "")}
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
