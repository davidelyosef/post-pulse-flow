
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post/PostCard";
import { usePostContext } from "@/contexts/PostContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, X, Edit, Save, Tags } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const PostSwiper = () => {
  const { pendingPosts, approvePost, rejectPost, updatePost, schedulePost, generateImagePrompts } = usePostContext();
  
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  
  // For tags editing
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  // For image generation
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  // Swipe threshold (difference in px to trigger a swipe action)
  const swipeThreshold = 100;
  
  const currentPost = pendingPosts[currentPostIndex];

  useEffect(() => {
    // Reset index if we've run out of posts
    if (currentPostIndex >= pendingPosts.length && pendingPosts.length > 0) {
      setCurrentPostIndex(pendingPosts.length - 1);
    }
  }, [pendingPosts, currentPostIndex]);

  const handleApprove = async () => {
    if (!currentPost) return;
    
    // If post doesn't have image prompts yet, generate them
    if (!currentPost.imagePrompts) {
      try {
        setIsGeneratingImage(true);
        await generateImagePrompts(currentPost.id);
      } finally {
        setIsGeneratingImage(false);
      }
    }
    
    // Store the current post's ID before approval
    const currentPostId = currentPost.id;
    
    // Approve the post
    approvePost(currentPostId);
    
    // After approving, we need to handle the next post navigation properly
    // The post will be removed from pendingPosts after approval
    // so we don't need to increment the index
    if (currentPostIndex >= pendingPosts.length - 1) {
      // If this was the last post, reset to last available item in the updated list
      // The useEffect will handle this edge case
    } else {
      // Even though we approved the post, we keep the same index
      // because the next post will "slide in" to the current position
      // No need to change currentPostIndex
    }
  };

  const handleReject = () => {
    if (!currentPost) return;
    
    // Store the current post's ID before rejection
    const currentPostId = currentPost.id;
    
    // Reject the post
    rejectPost(currentPostId);
    
    // Similar logic as handleApprove
    // The post will be removed from pendingPosts after rejection
    // so we don't need to increment the index
    if (currentPostIndex >= pendingPosts.length - 1) {
      // If this was the last post, reset to last available item
      // The useEffect will handle this edge case
    } else {
      // Even though we rejected the post, we keep the same index
      // because the next post will "slide in" to the current position
      // No need to change currentPostIndex
    }
  };

  const goToNextPost = () => {
    if (currentPostIndex < pendingPosts.length - 1) {
      setCurrentPostIndex(currentPostIndex + 1);
    }
  };

  const openEditDialog = () => {
    if (!currentPost) return;
    setEditContent(currentPost.content);
    setEditTags(currentPost.tags || []);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!currentPost) return;
    updatePost(currentPost.id, { 
      content: editContent,
      tags: editTags
    });
    setEditDialogOpen(false);
  };

  const openScheduleDialog = () => {
    if (!currentPost) return;
    setScheduleDate(new Date());
    setScheduleDialogOpen(true);
  };

  const handleSaveSchedule = () => {
    if (!currentPost || !scheduleDate) return;
    schedulePost(currentPost.id, scheduleDate);
    approvePost(currentPost.id); // Auto-approve scheduled posts
    setScheduleDialogOpen(false);
  };

  const addTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    if ('touches' in e) {
      setTouchStart(e.touches[0].clientX);
    } else {
      setTouchStart(e.clientX);
    }
    setTouchEnd(null); // Reset end position
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    let currentPosition: number;
    if ('touches' in e) {
      currentPosition = e.touches[0].clientX;
    } else {
      currentPosition = e.clientX;
    }
    
    setTouchEnd(currentPosition);
    
    // Calculate drag distance for animation
    if (touchStart !== null) {
      const offset = currentPosition - touchStart;
      setDragOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (!touchStart || !touchEnd) return;
    
    // Calculate swipe distance
    const distance = touchEnd - touchStart;
    const isSwipeRight = distance > swipeThreshold;
    const isSwipeLeft = distance < -swipeThreshold;
    
    if (isSwipeRight && currentPost) {
      handleApprove();
    } else if (isSwipeLeft && currentPost) {
      handleReject();
    }
    
    // Reset values
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (pendingPosts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-4">No pending posts to review</p>
        <Button variant="outline" onClick={() => window.location.href = "/generate"}>
          Generate New Posts
        </Button>
      </Card>
    );
  }

  return (
    <>
      <div className="relative h-[600px] w-full max-w-md mx-auto">
        {currentPost && (
          <div 
            className="absolute top-0 left-0 right-0 bottom-0"
            style={{ 
              transform: `translateX(${dragOffset}px) rotate(${dragOffset / 20}deg)`,
              transition: isDragging ? 'none' : 'transform 0.5s ease-out'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
          >
            <PostCard
              post={currentPost}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={openEditDialog}
              onSchedule={openScheduleDialog}
              className="h-full overflow-auto"
            />
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-muted-foreground mb-2">
          {currentPostIndex + 1} of {pendingPosts.length}
        </div>
      </div>

      {/* Enhanced Edit Post Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
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
                  Add
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter className="border-t pt-4 mt-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="gap-1">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="gap-1">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
            <DialogDescription>
              Choose when to publish this post on LinkedIn.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduleDate ? format(scheduleDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduleDate}
                  onSelect={setScheduleDate}
                  initialFocus
                  className="overflow-hidden max-w-full"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule} disabled={!scheduleDate}>
              Schedule Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostSwiper;
