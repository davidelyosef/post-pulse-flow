
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
  const [lastPostsLength, setLastPostsLength] = useState(0);

  // For image generation
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);

  // This effect handles navigation when no posts are left
  useEffect(() => {
    console.log('PostSwiper useEffect - pendingPosts length:', pendingPosts.length, 'currentPostIndex:', currentPostIndex);
    
    if (pendingPosts.length === 0) {
      setCurrentPostIndex(0);
      navigate('/schedule');
      return;
    }
  }, [pendingPosts.length, navigate]);

  // This effect handles index adjustment when posts are removed
  useEffect(() => {
    console.log('Index adjustment effect - posts length changed from', lastPostsLength, 'to', pendingPosts.length);
    
    // Only adjust if posts were removed (length decreased)
    if (lastPostsLength > pendingPosts.length && pendingPosts.length > 0) {
      // If current index is out of bounds, adjust it
      if (currentPostIndex >= pendingPosts.length) {
        const newIndex = Math.max(0, pendingPosts.length - 1);
        console.log('Adjusting currentPostIndex from', currentPostIndex, 'to', newIndex);
        setCurrentPostIndex(newIndex);
      }
    }
    
    // Update the last known length
    setLastPostsLength(pendingPosts.length);
  }, [pendingPosts.length, currentPostIndex]);

  const currentPost = pendingPosts.length > 0 ? pendingPosts[currentPostIndex] : null;

  const handleApprove = async () => {
    if (!currentPost) return;

    console.log('Approving post:', currentPost.id, 'currentIndex:', currentPostIndex, 'total posts:', pendingPosts.length);

    // If post doesn't have image prompts yet, generate them
    if (!currentPost.imagePrompts) {
      try {
        setIsGeneratingPrompts(true);
        await generateImagePrompts(currentPost.id);
      } finally {
        setIsGeneratingPrompts(false);
      }
    }

    // Approve the post (this will remove it from pendingPosts)
    await approvePost(currentPost.id);
    
    // The useEffect will handle index adjustment after state updates
  };

  const handleReject = () => {
    if (!currentPost) return;

    console.log('Rejecting post:', currentPost.id, 'currentIndex:', currentPostIndex, 'total posts:', pendingPosts.length);

    // Reject the post (this will remove it from pendingPosts)
    rejectPost(currentPost.id);
    
    // The useEffect will handle index adjustment after state updates
  };

  console.log('Rendering PostSwiper - pendingPosts:', pendingPosts.length, 'currentIndex:', currentPostIndex, 'currentPost:', currentPost?.id);

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
