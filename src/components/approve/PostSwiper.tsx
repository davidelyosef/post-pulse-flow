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
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

export const PostSwiper = () => {
  const { pendingPosts, approvePost, rejectPost, updatePost, schedulePost, generateImagePrompts } = usePostContext();
  
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  
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
    
    approvePost(currentPost.id);
    goToNextPost();
  };

  const handleReject = () => {
    if (!currentPost) return;
    rejectPost(currentPost.id);
    goToNextPost();
  };

  const goToNextPost = () => {
    if (currentPostIndex < pendingPosts.length - 1) {
      setCurrentPostIndex(currentPostIndex + 1);
    }
  };

  const openEditDialog = () => {
    if (!currentPost) return;
    setEditContent(currentPost.content);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!currentPost) return;
    updatePost(currentPost.id, { content: editContent });
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
    goToNextPost();
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to your post content.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea 
            value={editContent} 
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[200px]" 
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
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
