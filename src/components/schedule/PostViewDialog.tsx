
import { useState } from "react";
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

export const PostViewDialog = ({
  post,
  isOpen,
  onClose,
  onDelete,
  getUserId,
}: PostViewDialogProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageRegeneratedPosts, setImageRegeneratedPosts] = useState<Set<string>>(new Set());

  const handlePublishNow = async () => {
    if (!post) return;
    
    if (!isLinkedInConnected()) {
      toast.error("Please connect to LinkedIn before publishing");
      onClose();
      return;
    }
    
    setIsPublishing(true);
    try {
      const success = await publishPost(post.content, post.imageUrl);
      if (success) {
        onDelete(post.id);
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
    
    setIsSaving(true);
    try {
      await updatePostAPI(post.id, getUserId(), {
        description: post.content,
        imageUrl: post.imageUrl
      });
      
      setImageRegeneratedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
      
      toast.success("Post updated successfully!");
    } catch (error) {
      toast.error("Failed to update post");
      console.error("Error updating post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageRegenerated = (postId: string) => {
    setImageRegeneratedPosts(prev => new Set([...prev, postId]));
  };

  const shouldShowSaveButton = post && imageRegeneratedPosts.has(post.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Post Details</DialogTitle>
        </DialogHeader>
        
        {post && (
          <div className="py-4">
            <PostCard 
              post={post} 
              showActions={false}
              onImageRegenerated={() => handleImageRegenerated(post.id)}
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
          {shouldShowSaveButton && (
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
          )}
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
