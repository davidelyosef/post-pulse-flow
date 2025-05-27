
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
      setCurrentPostIndex(Math.max(0, pendingPosts.length - 1));
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

    // Store current index before approval
    const wasLastPost = currentPostIndex === pendingPosts.length - 1;

    // Approve the post (this will remove it from pendingPosts)
    await approvePost(currentPost.id);
    
    // After approval, adjust index if we were viewing the last post
    if (wasLastPost && pendingPosts.length > 1) {
      setCurrentPostIndex(Math.max(0, pendingPosts.length - 2));
    }
    // If we weren't on the last post, the same index will show the next post
  };

  const handleReject = () => {
    if (!currentPost) return;

    console.log('Rejecting post:', currentPost.id, 'currentIndex:', currentPostIndex, 'total posts:', pendingPosts.length);

    // Store current index before rejection
    const wasLastPost = currentPostIndex === pendingPosts.length - 1;

    // Reject the post (this will remove it from pendingPosts)
    rejectPost(currentPost.id);
    
    // After rejection, adjust index if we were viewing the last post
    if (wasLastPost && pendingPosts.length > 1) {
      setCurrentPostIndex(Math.max(0, pendingPosts.length - 2));
    }
    // If we weren't on the last post, the same index will show the next post
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
