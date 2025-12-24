
import { useState } from "react";
import { format } from "date-fns";
import { usePostContext } from "@/contexts/PostContext";
import { useUser } from "@/contexts/UserContext";
import { schedulePost as scheduleLinkedInPost, isLinkedInConnected } from "@/services/linkedinService";
import { toast } from "sonner";

export const usePostActions = () => {
  const { updatePost, deletePost, schedulePost, removeSchedule, publishPost } = usePostContext();
  const { getUserId } = useUser();
  
  const [viewPostDialogOpen, setViewPostDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState("12:00");

  const handleViewPost = (postId: string) => {
    setSelectedPostId(postId);
    setViewPostDialogOpen(true);
  };
  
  const handleEditPost = (postId: string) => {
    setSelectedPostId(postId);
    setEditDialogOpen(true);
  };
  
  const handleEditSave = (content: string, tags: string[], imageUrl?: string) => {
    if (!selectedPostId) return;
    updatePost(selectedPostId, { content, tags, ...(imageUrl && { imageUrl }) });
    setEditDialogOpen(false);
    toast.success("Post updated successfully");
  };
  
  const handleScheduleDialog = (postId: string, posts: any[]) => {
    setSelectedPostId(postId);
    const post = posts.find(p => p.id === postId);
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
  
  const handleSaveSchedule = (posts: any[]) => {
    if (selectedPostId && scheduledDate) {
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const dateTime = new Date(scheduledDate);
      dateTime.setHours(hours, minutes, 0, 0);
      
      schedulePost(selectedPostId, dateTime);
      
      if (isLinkedInConnected()) {
        const post = posts.find(p => p.id === selectedPostId);
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

  return {
    // State
    viewPostDialogOpen,
    editDialogOpen,
    scheduleDialogOpen,
    deleteDialogOpen,
    selectedPostId,
    scheduledDate,
    scheduledTime,
    // Setters
    setViewPostDialogOpen,
    setEditDialogOpen,
    setScheduleDialogOpen,
    setDeleteDialogOpen,
    setScheduledDate,
    setScheduledTime,
    // Handlers
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
  };
};
