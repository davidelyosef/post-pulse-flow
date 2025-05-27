
import { useState } from "react";
import { format } from "date-fns";
import { usePostContext } from "@/contexts/PostContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Send } from "lucide-react";
import { schedulePost as scheduleLinkedInPost, isLinkedInConnected } from "@/services/linkedinService";
import { toast } from "sonner";
import { EditPostDialog } from "@/components/approve/EditPostDialog";
import { useUser } from "@/contexts/UserContext";
import { ScheduledPostCard } from "./ScheduledPostCard";
import { PublishedPostCard } from "./PublishedPostCard";
import { PostViewDialog } from "./PostViewDialog";
import { PostScheduleDialog } from "./PostScheduleDialog";
import { PostDeleteDialog } from "./PostDeleteDialog";

export const ScheduledPostList = () => {
  const { approvedPosts, publishedPosts, deletePost, updatePost, schedulePost, removeSchedule, publishPost } = usePostContext();
  const { getUserId } = useUser();
  const scheduledPosts = approvedPosts.filter(post => post.scheduledFor);
  const unscheduledPosts = approvedPosts.filter(post => !post.scheduledFor);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [viewPostDialogOpen, setViewPostDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState("12:00");

  const selectedPost = selectedPostId 
    ? [...approvedPosts, ...publishedPosts].find(post => post.id === selectedPostId) 
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
    const post = [...approvedPosts, ...publishedPosts].find(post => post.id === postId);
    if (post) {
      setSelectedPostId(postId);
      setEditDialogOpen(true);
    }
  };
  
  const handleEditSave = (content: string, tags: string[]) => {
    if (!selectedPostId) return;
    updatePost(selectedPostId, { content, tags });
    setEditDialogOpen(false);
    toast.success("Post updated successfully");
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
      
      schedulePost(selectedPostId, dateTime);
      
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

  const handleRemoveSchedule = () => {
    if (selectedPostId) {
      removeSchedule(selectedPostId);
      setScheduleDialogOpen(false);
      toast.success("Schedule removed successfully");
    }
  };

  const handlePublishPost = (postId: string) => {
    publishPost(postId);
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
          <div key={post.id} className="relative">
            <ScheduledPostCard
              post={post}
              onView={handleViewPost}
              onEdit={handleEditPost}
              onSchedule={handleScheduleDialog}
              onDelete={handleDeleteDialog}
              isScheduled={true}
            />
            <Button
              size="sm"
              onClick={() => handlePublishPost(post.id)}
              className="absolute top-2 right-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-1" />
              Publish
            </Button>
          </div>
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
          <div key={post.id} className="relative">
            <ScheduledPostCard
              post={post}
              onView={handleViewPost}
              onEdit={handleEditPost}
              onSchedule={handleScheduleDialog}
              onDelete={handleDeleteDialog}
              isScheduled={false}
            />
            <Button
              size="sm"
              onClick={() => handlePublishPost(post.id)}
              className="absolute top-2 right-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-1" />
              Publish
            </Button>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mt-8">Published Posts</h2>
      
      {publishedPosts.length === 0 && (
        <Card className="text-center p-6 animate-fade-in">
          <p className="text-muted-foreground mb-4">No published posts yet</p>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publishedPosts.map((post) => (
          <PublishedPostCard
            key={post.id}
            post={post}
            onView={handleViewPost}
            onDelete={handleDeleteDialog}
          />
        ))}
      </div>
      
      <PostViewDialog
        post={selectedPost}
        isOpen={viewPostDialogOpen}
        onClose={() => setViewPostDialogOpen(false)}
        onDelete={deletePost}
        getUserId={getUserId}
      />
      
      <EditPostDialog
        post={selectedPost}
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleEditSave}
      />
      
      <PostScheduleDialog
        isOpen={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        scheduledDate={scheduledDate}
        scheduledTime={scheduledTime}
        onDateChange={setScheduledDate}
        onTimeChange={setScheduledTime}
        onSave={handleSaveSchedule}
        onRemoveSchedule={handleRemoveSchedule}
        isScheduled={!!selectedPost?.scheduledFor}
      />
      
      <PostDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ScheduledPostList;
