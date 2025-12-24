
import { Post } from "@/types";

interface PostCardContentProps {
  content: string;
}

export const PostCardContent = ({ content }: PostCardContentProps) => {
  return (
    <div className="prose prose-sm max-w-none">
      {content.split('\n\n').map((paragraph, index) => (
        <p key={index} className={index === 0 ? "font-medium text-base" : "text-base"}>
          {paragraph}
        </p>
      ))}
    </div>
  );
};
