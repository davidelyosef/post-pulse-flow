
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Post } from "@/types";
import { cn } from "@/lib/utils";
import { usePostContext } from "@/contexts/PostContext";
import { useSwipe } from "@/hooks/use-swipe";
import { PostCardTags } from "./card/PostCardTags";
import { PostCardContent } from "./card/PostCardContent";
import { PostCardImage } from "./card/PostCardImage";
import { PostCardActions } from "./card/PostCardActions";
import { extractHashtags } from "@/lib/hashtag-utils";

interface PostCardProps {
  post: Post;
  onApprove?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  onSchedule?: () => void;
  className?: string;
  showActions?: boolean;
  showTags?: boolean;
  onImageRegenerated?: () => void;
}

export const PostCard = ({
  post,
  onApprove,
  onReject,
  onEdit,
  onSchedule,
  className,
  showActions = true,
  showTags = true,
  onImageRegenerated,
}: PostCardProps) => {
  const [direction, setDirection] = useState<"" | "swipe-left" | "swipe-right">("");
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { generateImagePrompts, selectImagePrompt } = usePostContext();
  
  // Extract hashtags from content
  const extractedTags = extractHashtags(post.content);
  const allTags = [...new Set([...(post.tags || []), ...extractedTags])];
  
  // Add swipe functionality with specific HTMLDivElement type
  const cardRef = useSwipe<HTMLDivElement>({
    onSwipeLeft: () => {
      if (onReject) handleReject();
    },
    onSwipeRight: () => {
      if (onApprove) handleApprove();
    },
  });

  const handleApprove = () => {
    setDirection("swipe-right");
    setTimeout(() => {
      onApprove && onApprove();
    }, 300);
  };

  const handleReject = () => {
    setDirection("swipe-left");
    setTimeout(() => {
      onReject && onReject();
    }, 300);
  };

  const handleGenerateImagePrompts = async () => {
    if (!post.imagePrompts) {
      setIsGeneratingPrompts(true);
      try {
        await generateImagePrompts(post.id);
      } finally {
        setIsGeneratingPrompts(false);
      }
    }
  };

  const handleSelectImagePrompt = async (prompt: string) => {
    setIsGeneratingImage(true);
    try {
      await selectImagePrompt(post.id, prompt);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <Card 
      className={cn(
        "swipe-card shadow-lg transition-all hover:shadow-xl", 
        direction,
        className
      )}
      ref={cardRef}
    >
      <CardHeader className="pb-2 pt-4">
        <PostCardTags tags={allTags} showTags={showTags} />
      </CardHeader>
      <CardContent className="px-5 py-3">
        <PostCardContent content={post.content} />
        
        <PostCardImage 
          post={post}
          isGeneratingPrompts={isGeneratingPrompts}
          isGeneratingImage={isGeneratingImage}
          onGeneratePrompts={handleGenerateImagePrompts}
          onSelectPrompt={handleSelectImagePrompt}
          onImageRegenerated={onImageRegenerated}
        />
      </CardContent>
      <CardFooter className="pt-2 pb-4 px-5">
        <PostCardActions 
          showActions={showActions}
          onApprove={handleApprove}
          onReject={handleReject}
          onEdit={onEdit || (() => {})}
          onSchedule={onSchedule || (() => {})}
        />
      </CardFooter>
    </Card>
  );
};

export default PostCard;
