import { useState, useEffect } from "react";
import { PostCard } from "@/components/post/PostCard";
import { usePostContext } from "@/contexts/PostContext";
import { SwipeableCard } from "./SwipeableCard";
import { EmptyPostsView } from "./EmptyPostsView";
import { PostSwiperCounter } from "./PostSwiperCounter";
import { SwipeInstructions } from "./SwipeInstructions";
import { useNavigate } from "react-router-dom";

export const PostSwiper = () => {
  const { pendingPosts, approvePost, rejectPost, generateImagePrompts } = usePostContext();
  const navigate = useNavigate();

  const [currentPostIndex, setCurrentPostIndex] = useState(0);

  // For image generation
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);

  // This effect ensures the currentPostIndex stays within bounds when posts change
  useEffect(() => {
    if (pendingPosts.length > 0 && currentPostIndex >= pendingPosts.length) {
      setCurrentPostIndex(pendingPosts.length - 1);
    } else if (pendingPosts.length === 0) {
      setCurrentPostIndex(0);
      // Navigate to schedule page when no more posts to approve
      navigate('/schedule');
    }
  }, [pendingPosts, currentPostIndex, navigate]);

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

    // Approve the post (this now handles the API call and keeps the post)
    await approvePost(currentPostId);

    // Don't need to manually adjust index - the useEffect will handle it when pendingPosts changes
  };

  const handleReject = () => {
    if (!currentPost) return;

    // Store the current post's ID before rejection
    const currentPostId = currentPost.id;

    // Reject the post
    rejectPost(currentPostId);

    // Don't need to manually adjust index - the useEffect will handle it when pendingPosts changes
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
              className="h-full overflow-auto"
              showEditAndScheduleActions={false}
            />
          </SwipeableCard>
        )}

        <PostSwiperCounter currentIndex={currentPostIndex} totalCount={pendingPosts.length} />
      </div>

      <SwipeInstructions show={pendingPosts.length > 0} />
    </>
  );
};

export default PostSwiper;
