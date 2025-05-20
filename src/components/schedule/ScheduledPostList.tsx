
import { useState } from "react";
import { format } from "date-fns";
import { usePostContext } from "@/contexts/PostContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { PostCard } from "@/components/post/PostCard";
import { Calendar as CalendarIcon, Clock, Loader2, Edit, Trash2, Share2 } from "lucide-react";
import { publishPost, schedulePost as scheduleLinkedInPost, isLinkedInConnected } from "@/services/linkedinService";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export const ScheduledPostList = () => {
  const { approvedPosts, deletePost, updatePost, schedulePost } = usePostContext();
  const scheduledPosts = approvedPosts.filter(post => post.scheduledFor);
  const unscheduledPosts = approvedPosts.filter(post => !post.scheduledFor);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [viewPostDialogOpen, setViewPostDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState("12:00");

  const selectedPost = selectedPostId 
    ? approvedPosts.find(post => post.id === selectedPostId) 
    : null;

  const filteredScheduledPosts = selectedDate 
    ? scheduledPosts.filter(post => {
        if (!post.scheduledFor) return false;
        const postDate = new Date(post.scheduledFor);
        return postDate.toDateString() === selectedDate.toDateString();
      })
    : scheduledPosts;

  const handleViewPost = (postId: string) => {
    setSelectedPostId(postId);
    setViewPostDialogOpen(true);
  };
  
  const handleEditPost = (postId: string) => {
    const post = approvedPosts.find(post => post.id === postId);
    if (post) {
      setSelectedPostId(postId);
      setEditedContent(post.content);
      setEditDialogOpen(true);
    }
  };
  
  const handleSaveEdit = () => {
    if (selectedPostId && editedContent.trim()) {
      updatePost(selectedPostId, { content: editedContent });
      setEditDialogOpen(false);
      toast.success("Post updated successfully");
    }
  };
  
  const handleScheduleDialog = (postId: string) => {
    setSelectedPostId(postId);
    const post = approvedPosts.find(p => p.id === postId);
    if (post && post.scheduledFor) {
      const date = new Date(post.scheduledFor);
      setScheduledDate(date);
      setScheduledTime(
        `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      );
    } else {
      // Default to tomorrow at noon
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);
      setScheduledDate(tomorrow);
      setScheduledTime("12:00");
    }
    setScheduleDialogOpen(true);
  };
  
  const handleSaveSchedule = () => {
    if (selectedPostId && scheduledDate) {
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const dateTime = new Date(scheduledDate);
      dateTime.setHours(hours, minutes, 0, 0);
      
      // Update local state
      schedulePost(selectedPostId, dateTime);
      
      // If connected to LinkedIn, also schedule there
      if (isLinkedInConnected()) {
        const post = approvedPosts.find(p => p.id === selectedPostId);
        if (post) {
          scheduleLinkedInPost(post.content, dateTime, post.imageUrl);
        }
      }
      
      setScheduleDialogOpen(false);
      toast.success(`Post scheduled for ${format(dateTime, "PPP 'at' p")}`);
    }
  };
  
  const handleDeleteDialog = (postId: string) => {
    setSelectedPostId(postId);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (selectedPostId) {
      deletePost(selectedPostId);
      setDeleteDialogOpen(false);
      toast.success("Post deleted successfully");
    }
  };

  const handlePublishNow = async () => {
    if (!selectedPost) return;
    
    if (!isLinkedInConnected()) {
      toast.error("Please connect to LinkedIn before publishing");
      setViewPostDialogOpen(false);
      return;
    }
    
    setIsPublishing(true);
    try {
      const success = await publishPost(selectedPost.content, selectedPost.imageUrl);
      if (success) {
        deletePost(selectedPost.id);
        setViewPostDialogOpen(false);
        toast.success("Post published to LinkedIn successfully!");
      }
    } catch (error) {
      toast.error("Failed to publish post");
      console.error("Error publishing post:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">Scheduled Posts</h2>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
            {selectedDate && (
              <div className="p-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => setSelectedDate(undefined)}
                >
                  Clear filter
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
      
      {filteredScheduledPosts.length === 0 && (
        <Card className="text-center p-6 animate-fade-in">
          <p className="text-muted-foreground mb-4">
            {selectedDate
              ? `No posts scheduled for ${format(selectedDate, "PPP")}`
              : "No scheduled posts yet"}
          </p>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScheduledPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover-scale">
            <CardHeader className="p-4 bg-muted/30">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {post.scheduledFor ? format(new Date(post.scheduledFor), "PPP 'at' p") : "Unscheduled"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="line-clamp-4 mb-4 h-20">
                {post.content}
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => handleViewPost(post.id)} className="flex-1">
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditPost(post.id)} className="flex-grow-0">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleScheduleDialog(post.id)} className="flex-grow-0">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteDialog(post.id)} className="flex-grow-0 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <h2 className="text-2xl font-semibold mt-8">Approved Posts (Unscheduled)</h2>
      
      {unscheduledPosts.length === 0 && (
        <Card className="text-center p-6 animate-fade-in">
          <p className="text-muted-foreground mb-4">No approved posts waiting to be scheduled</p>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {unscheduledPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover-scale">
            <CardContent className="p-4">
              <div className="line-clamp-4 mb-4 h-20">
                {post.content}
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => handleViewPost(post.id)} className="flex-1">
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditPost(post.id)} className="flex-grow-0">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleScheduleDialog(post.id)} className="flex-grow-0">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteDialog(post.id)} className="flex-grow-0 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* View Post Dialog */}
      <Dialog open={viewPostDialogOpen} onOpenChange={setViewPostDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Post Details</DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="py-4">
              <PostCard post={selectedPost} showActions={false} />
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setViewPostDialogOpen(false)}
            >
              Close
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
      
      {/* Edit Post Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>Make changes to your post content below.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea 
              className="w-full min-h-[200px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
            <DialogDescription>Set when you want this post to be published on LinkedIn.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Select Date</p>
              <Calendar 
                mode="single"
                selected={scheduledDate}
                onSelect={setScheduledDate}
                initialFocus
                disabled={(date) => date < new Date()}
                className="rounded-md border mx-auto"
              />
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Select Time</p>
              <Input 
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setScheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule}>
              Schedule Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>Are you sure you want to delete this post? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduledPostList;
