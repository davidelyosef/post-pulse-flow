import { useState, useEffect } from "react";
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
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);

  // This effect ensures the currentPostIndex stays within bounds when posts change
  useEffect(() => {
    if (pendingPosts.length > 0 && currentPostIndex >= pendingPosts.length) {
      setCurrentPostIndex(pendingPosts.length - 1);
    } else if (pendingPosts.length === 0) {
      setCurrentPostIndex(0);
    }
  }, [pendingPosts, currentPostIndex]);

  const currentPost = pendingPosts.length > 0 ? pendingPosts[currentPostIndex] : null;

  const handleApprove = async () => {
    if (!currentPost) return;

    // If post doesn't have image prompts yet, generate them
    if (!currentPost.imagePrompts) {
      try {
        setIsGeneratingPrompts(true);
        await generateImagePrompts(currentPost.id);
      } finally {
        setIsGeneratingPrompts(false);
      }
    }

    // Store the current post's ID before approval
    const currentPostId = currentPost.id;

    // Keep track of the current index
    const currentIndex = currentPostIndex;

    // Approve the post (this now handles the API call and keeps the post)
    await approvePost(currentPostId);

    // Adjust the index if needed
    if (currentIndex >= pendingPosts.length - 1) {
      // If it was the last post, go to the new last post
      setCurrentPostIndex(Math.max(0, pendingPosts.length - 2));
    }
    // If it wasn't the last post, index stays the same as next post slides in
  };

  const handleReject = () => {
    if (!currentPost) return;

    // Store the current post's ID before rejection
    const currentPostId = currentPost.id;

    // Keep track of the current index
    const currentIndex = currentPostIndex;

    // Reject the post
    rejectPost(currentPostId);

    // Adjust the index if needed
    if (currentIndex >= pendingPosts.length - 1) {
      // If it was the last post, go to the new last post
      setCurrentPostIndex(Math.max(0, pendingPosts.length - 2));
    }
    // If it wasn't the last post, index stays the same as next post slides in
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
          <SwipeableCard onSwipeLeft={handleReject} onSwipeRight={handleApprove}>
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

        <PostSwiperCounter currentIndex={currentPostIndex} totalCount={pendingPosts.length} />
      </div>

      <SwipeInstructions show={pendingPosts.length > 0} />

      <EditPostDialog post={currentPost} isOpen={editDialogOpen} onClose={() => setEditDialogOpen(false)} onSave={handleEditSave} />

      <ScheduleDialog isOpen={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} onSave={handleScheduleSave} />
    </>
  );
};

export default PostSwiper;
