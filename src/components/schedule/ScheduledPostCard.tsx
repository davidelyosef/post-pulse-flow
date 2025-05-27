
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Edit, Trash2 } from "lucide-react";
import { Post } from "@/types";

interface ScheduledPostCardProps {
  post: Post;
  onView: (postId: string) => void;
  onEdit: (postId: string) => void;
  onSchedule: (postId: string) => void;
  onDelete: (postId: string) => void;
  isScheduled?: boolean;
}

export const ScheduledPostCard = ({
  post,
  onView,
  onEdit,
  onSchedule,
  onDelete,
  isScheduled = true,
}: ScheduledPostCardProps) => {
  return (
    <Card className="overflow-hidden hover-scale h-48">
      {isScheduled && (
        <CardHeader className="p-4 bg-muted/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">
                {post.scheduledFor ? format(new Date(post.scheduledFor), "PPP 'at' p") : "Unscheduled"}
              </span>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-4 flex flex-col h-full">
        <div className="line-clamp-4 mb-4 flex-1">
          {post.content}
        </div>
        <div className="flex gap-2 mt-auto">
          <Button variant="outline" size="sm" onClick={() => onView(post.id)} className="flex-1">
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(post.id)} className="flex-grow-0">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onSchedule(post.id)} className="flex-grow-0">
            <CalendarIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(post.id)} className="flex-grow-0 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
