
import { useState } from "react";
import { PostCard } from "@/components/post/PostCard";
import { usePostContext } from "@/contexts/PostContext";
import { SwipeableCard } from "./SwipeableCard";
import { EditPostDialog } from "./EditPostDialog";
import { ScheduleDialog } from "./ScheduleDialog";
import { EmptyPostsView } from "./EmptyPostsView";
import { PostSwiperCounter } from "./PostSwiperCounter";
import { SwipeInstructions } from "./SwipeInstructions";

export const PostSwiper = () => {
  const { pendingPosts, approvePost, rejectPost, updatePost, schedulePost, generateImagePrompts } = usePostContext();
  
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  
  // For image generation
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const currentPost = pendingPosts[currentPostIndex];

  // Reset index if we've run out of posts
  if (currentPostIndex >= pendingPosts.length && pendingPosts.length > 0) {
    setCurrentPostIndex(pendingPosts.length - 1);
  }

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
    
    // After approving, we don't need to increment the index
    // because the next post will "slide in" to the current position
  };

  const handleReject = () => {
    if (!currentPost) return;
    
    // Store the current post's ID before rejection
    const currentPostId = currentPost.id;
    
    // Reject the post
    rejectPost(currentPostId);
    
    // Similar logic as handleApprove
    // The post will be removed from pendingPosts after rejection
  };

  const handleEditSave = (content: string, tags: string[]) => {
    if (!currentPost) return;
    updatePost(currentPost.id, { content, tags });
    setEditDialogOpen(false);
  };

  const handleScheduleSave = (date: Date) => {
    if (!currentPost) return;
    schedulePost(currentPost.id, date);
    approvePost(currentPost.id); // Auto-approve scheduled posts
    setScheduleDialogOpen(false);
  };

  if (pendingPosts.length === 0) {
    return <EmptyPostsView />;
  }

  return (
    <>
      <div className="relative h-[600px] w-full max-w-md mx-auto">
        {currentPost && (
          <SwipeableCard
            onSwipeLeft={handleReject}
            onSwipeRight={handleApprove}
          >
            <PostCard
              post={currentPost}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={() => setEditDialogOpen(true)}
              onSchedule={() => setScheduleDialogOpen(true)}
              className="h-full overflow-auto"
            />
          </SwipeableCard>
        )}
        
        <PostSwiperCounter 
          currentIndex={currentPostIndex} 
          totalCount={pendingPosts.length} 
        />
      </div>

      <SwipeInstructions show={pendingPosts.length > 0} />

      <EditPostDialog
        post={currentPost} 
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleEditSave}
      />

      <ScheduleDialog
        isOpen={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        onSave={handleScheduleSave}
      />
    </>
  );
};

export default PostSwiper;
