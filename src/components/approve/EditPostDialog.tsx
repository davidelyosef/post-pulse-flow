
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, Tags, Image, Loader2, RefreshCw } from "lucide-react";
import { Post } from "@/types";
import { extractHashtags } from "@/lib/hashtag-utils";
import { usePostContext } from "@/contexts/PostContext";
import { PostCardImage } from "@/components/post/card/PostCardImage";

interface EditPostDialogProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: { content?: string; tags?: string[]; imageUrl?: string }) => void;
}

export const EditPostDialog = ({ post, isOpen, onClose, onSave }: EditPostDialogProps) => {
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const { generateImagePrompts, selectImagePrompt, posts } = usePostContext();

  // Get the current post from context to have the latest image data
  const currentPost = post ? posts.find(p => p.id === post.id) || post : null;

  // Set initial values when dialog opens with a post
  useEffect(() => {
    if (currentPost && isOpen) {
      console.log('EditPostDialog: Setting initial values for post:', currentPost.id, 'tags:', currentPost.tags);
      setEditContent(currentPost.content);
      
      // Extract hashtags from content and combine with existing tags
      const extractedTags = extractHashtags(currentPost.content);
      const allTags = [...new Set([...(currentPost.tags || []), ...extractedTags])];
      
      setEditTags(allTags);
    }
  }, [currentPost, isOpen]);

  const handleSave = () => {
    if (!currentPost) return;
    
    const updates: { content?: string; tags?: string[]; imageUrl?: string } = {};
    
    // Only include content if it changed
    if (editContent !== currentPost.content) {
      updates.content = editContent;
    }
    
    // Only include tags if they changed
    const originalTags = currentPost.tags || [];
    const tagsChanged = editTags.length !== originalTags.length || 
      editTags.some((tag, i) => tag !== originalTags[i]);
    if (tagsChanged) {
      updates.tags = editTags;
    }
    
    // Only include imageUrl if it changed
    if (currentPost.imageUrl !== post?.imageUrl) {
      updates.imageUrl = currentPost.imageUrl;
    }
    
    console.log('EditPostDialog: Saving updates:', updates);
    onSave(updates);
  };

  const handleGenerateImagePrompts = async () => {
    if (!currentPost || currentPost.imagePrompts) return;
    
    setIsGeneratingPrompts(true);
    try {
      await generateImagePrompts(currentPost.id);
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  const handleSelectImagePrompt = async (prompt: string) => {
    if (!currentPost) return;
    await selectImagePrompt(currentPost.id, prompt);
  };

  const handleImageRegenerated = (newImageUrl: string) => {
    // Image update is handled by the PostCardImage component and context
    console.log('EditPostDialog: Image regenerated:', newImageUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl" size="large">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Edit className="h-5 w-5" />
            Edit Post
          </DialogTitle>
          <DialogDescription className="text-base">
            Customize your post content and metadata before publishing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Content editing */}
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">Post Content</label>
            <Textarea 
              id="content"
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[180px] resize-none focus:ring-2 focus:ring-primary" 
              placeholder="Enter your post content here..."
            />
            <p className="text-xs text-muted-foreground">
              Use #hashtags in your content to automatically add tags
            </p>
          </div>
          
          {/* Tags display (read-only) */}
          {editTags.length > 0 && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Tags className="h-4 w-4" />
                Tags
              </label>
              
              <div className="flex flex-wrap gap-2">
                {editTags.map(tag => (
                  <Badge key={tag} className="bg-primary/20 text-foreground">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Image Generation Section */}
          {currentPost && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Image className="h-4 w-4" />
                Post Image
              </label>
              
              <PostCardImage 
                post={currentPost}
                isGeneratingPrompts={isGeneratingPrompts}
                isGeneratingImage={false}
                onGeneratePrompts={handleGenerateImagePrompts}
                onSelectPrompt={handleSelectImagePrompt}
                onImageRegenerated={handleImageRegenerated}
              />
            </div>
          )}
        </div>
        
        <DialogFooter className="border-t pt-4 mt-2">
          <Button variant="outline" onClick={onClose} className="gap-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-1">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
