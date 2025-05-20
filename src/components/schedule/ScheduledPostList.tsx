
import { useState } from "react";
import { format } from "date-fns";
import { usePostContext } from "@/contexts/PostContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PostCard } from "@/components/post/PostCard";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { publishPost } from "@/services/linkedinService";
import { toast } from "sonner";

export const ScheduledPostList = () => {
  const { approvedPosts, deletePost } = usePostContext();
  const scheduledPosts = approvedPosts.filter(post => post.scheduledFor);
  const unscheduledPosts = approvedPosts.filter(post => !post.scheduledFor);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [viewPostDialogOpen, setViewPostDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const selectedPost = selectedPostId 
    ? approvedPosts.find(post => post.id === selectedPostId) 
    : null;

  const filteredScheduledPosts = selectedDate 
    ? scheduledPosts.filter(post => {
        if (!post.scheduledFor) return false;
        const postDate = new Date(post.scheduledFor);
        return postDate.toDateString() === selectedDate.toDateString();
      })
    : scheduledPosts;

  const handleViewPost = (postId: string) => {
    setSelectedPostId(postId);
    setViewPostDialogOpen(true);
  };

  const handlePublishNow = async () => {
    if (!selectedPost) return;
    
    setIsPublishing(true);
    try {
      const success = await publishPost(selectedPost.content, selectedPost.imageUrl);
      if (success) {
        deletePost(selectedPost.id);
        setViewPostDialogOpen(false);
      }
    } catch (error) {
      toast.error("Failed to publish post");
      console.error("Error publishing post:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">Scheduled Posts</h2>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
            {selectedDate && (
              <div className="p-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => setSelectedDate(undefined)}
                >
                  Clear filter
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
      
      {filteredScheduledPosts.length === 0 && (
        <Card className="text-center p-6">
          <p className="text-muted-foreground mb-4">
            {selectedDate
              ? `No posts scheduled for ${format(selectedDate, "PPP")}`
              : "No scheduled posts yet"}
          </p>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScheduledPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="p-4 bg-muted/30">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {post.scheduledFor ? format(new Date(post.scheduledFor), "PPP") : "Unscheduled"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="line-clamp-4 mb-4 h-20">
                {post.content}
              </div>
              <Button variant="outline" className="w-full" onClick={() => handleViewPost(post.id)}>
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <h2 className="text-2xl font-semibold mt-8">Approved Posts (Unscheduled)</h2>
      
      {unscheduledPosts.length === 0 && (
        <Card className="text-center p-6">
          <p className="text-muted-foreground mb-4">No approved posts waiting to be scheduled</p>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {unscheduledPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="line-clamp-4 mb-4 h-20">
                {post.content}
              </div>
              <Button variant="outline" className="w-full" onClick={() => handleViewPost(post.id)}>
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* View Post Dialog */}
      <Dialog open={viewPostDialogOpen} onOpenChange={setViewPostDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="py-4">
              <PostCard post={selectedPost} showActions={false} />
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setViewPostDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={handlePublishNow}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Now"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduledPostList;
