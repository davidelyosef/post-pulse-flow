
import { Badge } from "@/components/ui/badge";
import { Post } from "@/types";

interface PostCardTagsProps {
  tags: string[];
  showTags: boolean;
}

export const PostCardTags = ({ tags, showTags }: PostCardTagsProps) => {
  if (!showTags || !tags || tags.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
    </div>
  );
};
