import { useState, useEffect } from "react";
import { PostCard } from "@/components/post/PostCard";
import { usePostContext } from "@/contexts/PostContext";
import { SwipeableCard } from "./SwipeableCard";
import { EmptyPostsView } from "./EmptyPostsView";
import { PostSwiperCounter } from "./PostSwiperCounter";
import { SwipeInstructions } from "./SwipeInstructions";
import { useNavigate } from "react-router-dom";
import { ApproveRejectButtons } from "./ApproveRejectButtons";

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

    // Calculate what the new index should be after this post is removed
    const newLength = pendingPosts.length - 1;
    if (newLength === 0) {
      // No posts left after this one
      setCurrentPostIndex(0);
    } else if (currentPostIndex >= newLength) {
      // We're at the last post, go to the previous one
      setCurrentPostIndex(newLength - 1);
    }
    // If we're not at the last post, the index stays the same (next post slides in)

    // Approve the post (this will remove it from pendingPosts)
    await approvePost(currentPost.id);
  };

  const handleReject = () => {
    if (!currentPost) return;

    console.log('Rejecting post:', currentPost.id, 'currentIndex:', currentPostIndex, 'total posts:', pendingPosts.length);

    // Calculate what the new index should be after this post is removed
    const newLength = pendingPosts.length - 1;
    if (newLength === 0) {
      // No posts left after this one
      setCurrentPostIndex(0);
    } else if (currentPostIndex >= newLength) {
      // We're at the last post, go to the previous one
      setCurrentPostIndex(newLength - 1);
    }
    // If we're not at the last post, the index stays the same (next post slides in)

    // Reject the post (this will remove it from pendingPosts)
    rejectPost(currentPost.id);
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
              className="h-full overflow-auto"
              showEditAndScheduleActions={false}
            />
          </SwipeableCard>
        )}

        <PostSwiperCounter currentIndex={currentPostIndex} totalCount={pendingPosts.length} />
      </div>

      <ApproveRejectButtons 
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <SwipeInstructions show={pendingPosts.length > 0} />
    </>
  );
};

export default PostSwiper;
