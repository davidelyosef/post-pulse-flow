
import { useState } from "react";
import { usePostContext } from "@/contexts/PostContext";
import { EditPostDialog } from "@/components/approve/EditPostDialog";
import { PostViewDialog } from "./PostViewDialog";
import { PostScheduleDialog } from "./PostScheduleDialog";
import { PostDeleteDialog } from "./PostDeleteDialog";
import { ScheduledPostsSection } from "./components/ScheduledPostsSection";
import { PostSection } from "./components/PostSection";
import { usePostActions } from "./hooks/usePostActions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const ScheduledPostList = () => {
  const { approvedPosts, deletePost } = usePostContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [removeAllDialogOpen, setRemoveAllDialogOpen] = useState(false);
  
  const {
    viewPostDialogOpen,
    editDialogOpen,
    scheduleDialogOpen,
    deleteDialogOpen,
    selectedPostId,
    scheduledDate,
    scheduledTime,
    setViewPostDialogOpen,
    setEditDialogOpen,
    setScheduleDialogOpen,
    setDeleteDialogOpen,
    setScheduledDate,
    setScheduledTime,
    handleViewPost,
    handleEditPost,
    handleEditSave,
    handleScheduleDialog,
    handleSaveSchedule,
    handleDeleteDialog,
    handleConfirmDelete,
    handleRemoveSchedule,
    handlePublishPost,
    getUserId,
  } = usePostActions();

  // Filter posts based on their status
  const scheduledPosts = approvedPosts.filter(post => post.scheduledFor);
  const publishedPosts = approvedPosts.filter(post => post.publishedAt && !post.scheduledFor);
  const unscheduledPosts = approvedPosts.filter(post => !post.scheduledFor && !post.publishedAt);

  const selectedPost = selectedPostId 
    ? [...approvedPosts, ...publishedPosts].find(post => post.id === selectedPostId) 
    : null;

  const handleRemoveAllApproved = async () => {
    const postsToDelete = approvedPosts.filter(post => !post.publishedAt);
    if (postsToDelete.length === 0) {
      toast.info("No approved posts to remove");
      return;
    }
    
    try {
      await Promise.all(postsToDelete.map(post => deletePost(post.id)));
      toast.success(`Removed ${postsToDelete.length} approved post${postsToDelete.length > 1 ? 's' : ''}`);
    } catch (error) {
      toast.error("Failed to remove some posts");
    }
    setRemoveAllDialogOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* Remove All Approved Posts Button */}
      {approvedPosts.filter(post => !post.publishedAt).length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setRemoveAllDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove All Approved Posts
          </Button>
        </div>
      )}

      <ScheduledPostsSection
        scheduledPosts={scheduledPosts}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onView={handleViewPost}
        onEdit={handleEditPost}
        onSchedule={(postId) => handleScheduleDialog(postId, approvedPosts)}
        onDelete={handleDeleteDialog}
        onPublish={handlePublishPost}
      />
      
      <PostSection
        title="Approved Posts (Unscheduled)"
        posts={unscheduledPosts}
        emptyMessage="No approved posts waiting to be scheduled"
        onView={handleViewPost}
        onEdit={handleEditPost}
        onSchedule={(postId) => handleScheduleDialog(postId, approvedPosts)}
        onDelete={handleDeleteDialog}
        onPublish={handlePublishPost}
        showPublishButton={true}
        isScheduled={false}
      />

      <PostSection
        title="Published Posts"
        posts={publishedPosts}
        emptyMessage="No published posts yet"
        onView={handleViewPost}
        onEdit={handleEditPost}
        onSchedule={(postId) => handleScheduleDialog(postId, approvedPosts)}
        onDelete={handleDeleteDialog}
        onPublish={handlePublishPost}
        isPublished={true}
      />
      
      <PostViewDialog
        post={selectedPost}
        isOpen={viewPostDialogOpen}
        onClose={() => setViewPostDialogOpen(false)}
        onDelete={() => {}}
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
        onSave={() => handleSaveSchedule(approvedPosts)}
        onRemoveSchedule={handleRemoveSchedule}
        isScheduled={!!selectedPost?.scheduledFor}
      />
      
      <PostDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Remove All Approved Posts Dialog */}
      <PostDeleteDialog
        isOpen={removeAllDialogOpen}
        onClose={() => setRemoveAllDialogOpen(false)}
        onConfirm={handleRemoveAllApproved}
        title="Remove All Approved Posts"
        description="Are you sure you want to remove all approved posts? This action cannot be undone."
      />
    </div>
  );
};

export default ScheduledPostList;
