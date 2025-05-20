
import { useState } from "react";
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
  const { pendingPosts, approvePost, rejectPost, updatePost, schedulePost } = usePostContext();
  
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  
  // For image generation
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const currentPost = pendingPosts[currentPostIndex];

  const handleApprove = () => {
    if (!currentPost) return;
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
      <div className="relative h-[500px] w-full max-w-md mx-auto">
        {currentPost && (
          <PostCard
            post={currentPost}
            onApprove={handleApprove}
            onReject={handleReject}
            onEdit={openEditDialog}
            onSchedule={openScheduleDialog}
            className="h-full"
          />
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
