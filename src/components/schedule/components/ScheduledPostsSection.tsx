
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { PostSection } from "./PostSection";
import { DateFilter } from "./DateFilter";
import { Post } from "@/types";

interface ScheduledPostsSectionProps {
  scheduledPosts: Post[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onView: (postId: string) => void;
  onEdit: (postId: string) => void;
  onSchedule: (postId: string) => void;
  onDelete: (postId: string) => void;
  onPublish: (postId: string) => void;
}

export const ScheduledPostsSection = ({
  scheduledPosts,
  selectedDate,
  onDateSelect,
  onView,
  onEdit,
  onSchedule,
  onDelete,
  onPublish,
}: ScheduledPostsSectionProps) => {
  const filteredScheduledPosts = selectedDate 
    ? scheduledPosts.filter(post => {
        if (!post.scheduledFor) return false;
        const postDate = new Date(post.scheduledFor);
        return postDate.toDateString() === selectedDate.toDateString();
      })
    : scheduledPosts;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">Scheduled Posts</h2>
        <DateFilter selectedDate={selectedDate} onDateSelect={onDateSelect} />
      </div>
      
      {filteredScheduledPosts.length === 0 && (
        <Card className="text-center p-6 animate-fade-in">
          <p className="text-muted-foreground mb-4">
            {selectedDate
              ? `No posts scheduled for ${format(selectedDate, "PPP")}`
              : "No scheduled posts yet"}
          </p>
        </Card>
      )}
      
      {filteredScheduledPosts.length > 0 && (
        <div className="">
          {filteredScheduledPosts.map((post) => (
            <PostSection
              key={post.id}
              title=""
              posts={[post]}
              emptyMessage=""
              onView={onView}
              onEdit={onEdit}
              onSchedule={onSchedule}
              onDelete={onDelete}
              onPublish={onPublish}
              showPublishButton={true}
              isScheduled={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
