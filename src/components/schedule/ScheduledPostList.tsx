
import { useState } from "react";
import { usePostContext } from "@/contexts/PostContext";
import { EditPostDialog } from "@/components/approve/EditPostDialog";
import { PostViewDialog } from "./PostViewDialog";
import { PostScheduleDialog } from "./PostScheduleDialog";
import { PostDeleteDialog } from "./PostDeleteDialog";
import { ScheduledPostsSection } from "./components/ScheduledPostsSection";
import { PostSection } from "./components/PostSection";
import { usePostActions } from "./hooks/usePostActions";

export const ScheduledPostList = () => {
  const { approvedPosts } = usePostContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
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

  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default ScheduledPostList;
