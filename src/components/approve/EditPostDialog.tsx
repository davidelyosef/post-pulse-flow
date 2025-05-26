
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, Tags, X, Plus } from "lucide-react";
import { Post } from "@/types";
import { extractHashtags } from "@/lib/hashtag-utils";

interface EditPostDialogProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, tags: string[]) => void;
}

export const EditPostDialog = ({ post, isOpen, onClose, onSave }: EditPostDialogProps) => {
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Set initial values when dialog opens with a post
  useEffect(() => {
    if (post && isOpen) {
      console.log('EditPostDialog: Setting initial values for post:', post.id, 'tags:', post.tags);
      setEditContent(post.content);
      
      // Extract hashtags from content and combine with existing tags
      const extractedTags = extractHashtags(post.content);
      const allTags = [...new Set([...(post.tags || []), ...extractedTags])];
      
      setEditTags(allTags);
    }
  }, [post, isOpen]);

  const addTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      const updatedTags = [...editTags, newTag.trim()];
      console.log('EditPostDialog: Adding tag, new tags array:', updatedTags);
      setEditTags(updatedTags);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = editTags.filter(tag => tag !== tagToRemove);
    console.log('EditPostDialog: Removing tag, new tags array:', updatedTags);
    setEditTags(updatedTags);
  };

  const handleSave = () => {
    console.log('EditPostDialog: Saving with content:', editContent, 'and tags:', editTags);
    onSave(editContent, editTags);
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
          
          {/* Tags editing */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Tags className="h-4 w-4" />
              Tags
            </label>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {editTags.map(tag => (
                <Badge key={tag} className="flex items-center gap-1 bg-primary/20 hover:bg-primary/30 text-foreground">
                  {tag}
                  <button 
                    onClick={() => removeTag(tag)} 
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input 
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag..." 
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button 
                onClick={addTag} 
                size="sm" 
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
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
