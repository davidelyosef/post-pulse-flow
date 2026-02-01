
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Eye, Trash2, Edit, Send } from "lucide-react";
import { Post } from "@/types";

interface PublishedPostCardProps {
  post: Post;
  onView: (postId: string) => void;
  onEdit: (postId: string) => void;
  onSchedule: (postId: string) => void;
  onDelete: (postId: string) => void;
  onPublish: (postId: string) => void;
}

export const PublishedPostCard = ({
  post,
  onView,
  onEdit,
  onSchedule,
  onDelete,
  onPublish,
}: PublishedPostCardProps) => {
  return (
    <Card className="overflow-hidden hover-scale">
      <CardHeader className="p-4 bg-green-50 dark:bg-green-900/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Published {post.publishedAt ? format(new Date(post.publishedAt), "PPP 'at' p") : ""}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col">
        <div className="line-clamp-4 mb-4 min-h-0 flex-shrink">
          {post.content}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => onView(post.id)} className="flex-1 min-w-0">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(post.id)} className="flex-grow-0">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onSchedule(post.id)} className="flex-grow-0" title="Reschedule">
            <CalendarIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPublish(post.id)} className="flex-grow-0 bg-green-600 hover:bg-green-700 text-white border-green-600">
            <Send className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(post.id)} className="flex-grow-0 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
