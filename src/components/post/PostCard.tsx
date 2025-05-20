
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

interface PostCardProps {
  post: Post;
  onApprove?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  onSchedule?: () => void;
  className?: string;
  showActions?: boolean;
  showTags?: boolean;
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
}: PostCardProps) => {
  const [direction, setDirection] = useState<"" | "swipe-left" | "swipe-right">("");
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { generateImagePrompts, selectImagePrompt, generateImage } = usePostContext();
  
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
    selectImagePrompt(post.id, prompt);
    
    if (!post.imageUrl) {
      setIsGeneratingImage(true);
      try {
        await generateImage(post.id, prompt);
      } finally {
        setIsGeneratingImage(false);
      }
    }
  };

  console.log("post: ", post);

  return (
    <Card 
      className={cn("swipe-card shadow-lg", direction, className)}
      ref={cardRef}
    >
      <CardHeader className="pb-2">
        <PostCardTags tags={post.tags} showTags={showTags} />
      </CardHeader>
      <CardContent>
        <PostCardContent content={post.content} />
        
        <PostCardImage 
          post={post}
          isGeneratingPrompts={isGeneratingPrompts}
          isGeneratingImage={isGeneratingImage}
          onGeneratePrompts={handleGenerateImagePrompts}
          onSelectPrompt={handleSelectImagePrompt}
        />
      </CardContent>
      <CardFooter>
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
