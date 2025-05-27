
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScheduledPostCard } from "../ScheduledPostCard";
import { PublishedPostCard } from "../PublishedPostCard";
import { Post } from "@/types";

interface PostSectionProps {
  title: string;
  posts: Post[];
  emptyMessage: string;
  onView: (postId: string) => void;
  onEdit: (postId: string) => void;
  onSchedule: (postId: string) => void;
  onDelete: (postId: string) => void;
  onPublish?: (postId: string) => void;
  showPublishButton?: boolean;
  isScheduled?: boolean;
  isPublished?: boolean;
}

export const PostSection = ({
  title,
  posts,
  emptyMessage,
  onView,
  onEdit,
  onSchedule,
  onDelete,
  onPublish,
  showPublishButton = false,
  isScheduled = false,
  isPublished = false,
}: PostSectionProps) => {
  if (posts.length === 0) {
    return (
      <>
        <h2 className="text-2xl font-semibold mt-8">{title}</h2>
        <Card className="text-center p-6 animate-fade-in">
          <p className="text-muted-foreground mb-4">{emptyMessage}</p>
        </Card>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold mt-8">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="relative">
            {isPublished ? (
              <PublishedPostCard
                post={post}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onPublish={onPublish!}
              />
            ) : (
              <ScheduledPostCard
                post={post}
                onView={onView}
                onEdit={onEdit}
                onSchedule={onSchedule}
                onDelete={onDelete}
                isScheduled={isScheduled}
              />
            )}
            {showPublishButton && onPublish && (
              <Button
                size="sm"
                onClick={() => onPublish(post.id)}
                className="absolute top-2 right-2 bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-1" />
                Publish
              </Button>
            )}
          </div>
        ))}
      </div>
    </>
  );
};
