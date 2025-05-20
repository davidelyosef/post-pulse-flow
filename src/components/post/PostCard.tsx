
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Edit, Calendar, Image, Loader2 } from "lucide-react";
import { Post } from "@/types";
import { cn } from "@/lib/utils";
import { usePostContext } from "@/contexts/PostContext";

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

  return (
    <Card className={cn("swipe-card shadow-lg", direction, className)}>
      <CardHeader className="pb-2">
        {post.subject && (
          <h3 className="text-xl font-semibold">{post.subject}</h3>
        )}
        {showTags && post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line">{post.content}</p>
        
        {/* Image Section */}
        {post.imageUrl ? (
          <div className="mt-4">
            <img 
              src={post.imageUrl} 
              alt="Post visual" 
              className="rounded-lg w-full h-auto object-cover"
            />
          </div>
        ) : (
          <div className="mt-4">
            {isGeneratingPrompts ? (
              <div className="flex justify-center items-center p-6 border rounded-lg border-dashed">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Generating image ideas...</span>
              </div>
            ) : isGeneratingImage ? (
              <div className="flex justify-center items-center p-6 border rounded-lg border-dashed">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Generating image...</span>
              </div>
            ) : post.imagePrompts ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Select an image concept:</p>
                <div className="grid gap-2">
                  {post.imagePrompts.map((prompt, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      className="justify-start text-left h-auto py-2 font-normal"
                      onClick={() => handleSelectImagePrompt(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full py-8 flex flex-col gap-2" 
                onClick={handleGenerateImagePrompts}
              >
                <Image className="h-8 w-8 opacity-50" />
                <span>Generate image ideas</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
      {showActions && (
        <CardFooter className="flex justify-between pt-2">
          <Button variant="outline" size="icon" className="rounded-full" onClick={handleReject}>
            <X className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full" onClick={onEdit}>
              <Edit className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" onClick={onSchedule}>
              <Calendar className="h-5 w-5" />
            </Button>
          </div>
          <Button variant="outline" size="icon" className="rounded-full" onClick={handleApprove}>
            <Check className="h-5 w-5" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PostCard;
