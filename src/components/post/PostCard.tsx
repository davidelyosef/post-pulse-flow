
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Edit, Calendar } from "lucide-react";
import { Post } from "@/types";
import { cn } from "@/lib/utils";

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
        {post.imageUrl && (
          <div className="mt-4">
            <img 
              src={post.imageUrl} 
              alt="Post visual" 
              className="rounded-lg w-full h-auto object-cover"
            />
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
