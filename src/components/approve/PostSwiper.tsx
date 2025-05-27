
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
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);

  // Handle navigation when no posts are left
  useEffect(() => {
    if (pendingPosts.length === 0) {
      setCurrentPostIndex(0);
      navigate('/schedule');
      return;
    }

    // Ensure currentPostIndex is always valid
    if (currentPostIndex >= pendingPosts.length) {
      setCurrentPostIndex(0);
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

    // Approve the post (this will remove it from pendingPosts)
    await approvePost(currentPost.id);
    
    // After approval, if we were at the last post and there are still posts left,
    // move to the previous index to show the next available post
    if (currentPostIndex >= pendingPosts.length - 1 && pendingPosts.length > 1) {
      setCurrentPostIndex(Math.max(0, currentPostIndex - 1));
    }
  };

  const handleReject = () => {
    if (!currentPost) return;

    console.log('Rejecting post:', currentPost.id, 'currentIndex:', currentPostIndex, 'total posts:', pendingPosts.length);

    // Reject the post (this will remove it from pendingPosts)
    rejectPost(currentPost.id);
    
    // After rejection, if we were at the last post and there are still posts left,
    // move to the previous index to show the next available post
    if (currentPostIndex >= pendingPosts.length - 1 && pendingPosts.length > 1) {
      setCurrentPostIndex(Math.max(0, currentPostIndex - 1));
    }
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
