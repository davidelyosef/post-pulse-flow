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
    console.log('PostSwiper useEffect - pendingPosts length:', pendingPosts.length, 'currentPostIndex:', currentPostIndex);
    
    if (pendingPosts.length === 0) {
      setCurrentPostIndex(0);
      // Navigate to schedule page when no more posts to approve
      navigate('/schedule');
      return;
    }
    
    // If current index is out of bounds, adjust it
    if (currentPostIndex >= pendingPosts.length) {
      const newIndex = Math.max(0, pendingPosts.length - 1);
      console.log('Adjusting currentPostIndex from', currentPostIndex, 'to', newIndex);
      setCurrentPostIndex(newIndex);
    }
  }, [pendingPosts.length, currentPostIndex, navigate]);

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

    // Store the current post's ID and index before approval
    const currentPostId = currentPost.id;
    const currentIndex = currentPostIndex;

    // Approve the post (this will remove it from pendingPosts)
    await approvePost(currentPostId);

    // After approval, adjust the index if necessary
    // If we were viewing the last post, go to the previous one
    // Otherwise, the same index will show the next post (since the current one was removed)
    if (currentIndex >= pendingPosts.length - 1 && pendingPosts.length > 1) {
      console.log('Was last post, moving to previous index');
      setCurrentPostIndex(currentIndex - 1);
    }
    // If there's only one post left (the one we just approved), it will be handled by useEffect
  };

  const handleReject = () => {
    if (!currentPost) return;

    console.log('Rejecting post:', currentPost.id, 'currentIndex:', currentPostIndex, 'total posts:', pendingPosts.length);

    // Store the current post's ID and index before rejection
    const currentPostId = currentPost.id;
    const currentIndex = currentPostIndex;

    // Reject the post (this will remove it from pendingPosts)
    rejectPost(currentPostId);

    // After rejection, adjust the index if necessary
    // If we were viewing the last post, go to the previous one
    // Otherwise, the same index will show the next post (since the current one was removed)
    if (currentIndex >= pendingPosts.length - 1 && pendingPosts.length > 1) {
      console.log('Was last post, moving to previous index');
      setCurrentPostIndex(currentIndex - 1);
    }
    // If there's only one post left (the one we just rejected), it will be handled by useEffect
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
