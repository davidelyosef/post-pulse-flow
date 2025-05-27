import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Share2, MoreHorizontal, ThumbsUp, MessageCircle, Repeat2, Send, Globe } from "lucide-react";
import { Post } from "@/types";
import { publishPost, isLinkedInConnected, getLinkedInUser } from "@/services/linkedinService";
import { updatePost as updatePostAPI } from "@/services/postService";
import { usePostContext } from "@/contexts/PostContext";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { extractHashtags } from "@/lib/hashtag-utils";

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
  const { user } = useUser();

  // Get LinkedIn user data for profile image
  const linkedinUser = getLinkedInUser();

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
      const success = await publishPost(currentPost.content, currentPost.imageUrl, currentPost.id);
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

  // Extract hashtags from content
  const extractedTags = extractHashtags(currentPost?.content || "");
  const allTags = [...new Set([...(currentPost?.tags || []), ...extractedTags])];

  // Format content with hashtags highlighted
  const formatContentWithHashtags = (content: string) => {
    const hashtagRegex = /#\w+/g;
    const parts = content.split(hashtagRegex);
    const hashtags = content.match(hashtagRegex) || [];
    
    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {hashtags[index] && (
          <span className="text-blue-600 font-medium">{hashtags[index]}</span>
        )}
      </span>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 bg-white" size="large">
        {currentPost && (
          <div className="bg-white rounded-lg overflow-hidden">
            {/* LinkedIn Post Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage 
                      src={linkedinUser?.profilePicture || user?.avatar} 
                      alt={linkedinUser?.displayName || user?.name || "User"} 
                    />
                    <AvatarFallback className="bg-blue-600 text-white font-semibold">
                      {(linkedinUser?.displayName || user?.name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {linkedinUser?.displayName || user?.name || "LinkedIn User"}
                      </h3>
                      <span className="text-xs text-gray-500">• 1st</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Full Stack Developer at WebFlow
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="text-xs text-gray-500">
                        {currentPost.publishedAt 
                          ? `Published ${new Date(currentPost.publishedAt).toLocaleDateString()}`
                          : currentPost.scheduledFor 
                            ? `Scheduled for ${new Date(currentPost.scheduledFor).toLocaleDateString()}`
                            : "Draft"
                        }
                      </span>
                      <Globe className="w-3 h-3 text-gray-500" />
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreHorizontal className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-4">
              <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                {formatContentWithHashtags(currentPost.content)}
              </div>
              
              {/* Tags */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {allTags.slice(0, 5).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </Badge>
                  ))}
                  {allTags.length > 5 && (
                    <Badge variant="secondary" className="text-xs px-2 py-1 bg-gray-50 text-gray-600">
                      +{allTags.length - 5} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Post Image */}
              {currentPost.imageUrl && (
                <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={currentPost.imageUrl} 
                    alt="Post content" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </div>

            {/* LinkedIn Engagement Stats */}
            <div className="px-4 py-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <ThumbsUp className="w-2 h-2 text-white" />
                  </div>
                  <span>{currentPost.analytics?.likes || Math.floor(Math.random() * 50)} likes</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>{currentPost.analytics?.comments || Math.floor(Math.random() * 10)} comments</span>
                  <span>{currentPost.analytics?.views || Math.floor(Math.random() * 200)} views</span>
                </div>
              </div>
            </div>

            {/* LinkedIn Action Buttons */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center justify-around">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600 hover:bg-gray-50 flex-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Like</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600 hover:bg-gray-50 flex-1">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Comment</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600 hover:bg-gray-50 flex-1">
                  <Repeat2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Repost</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600 hover:bg-gray-50 flex-1">
                  <Send className="w-4 h-4" />
                  <span className="text-sm font-medium">Send</span>
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between p-4 border-t border-gray-100 bg-gray-50">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleSavePost}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={handlePublishNow}
                  disabled={isPublishing || !isLinkedInConnected()}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      <span>Publish</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
