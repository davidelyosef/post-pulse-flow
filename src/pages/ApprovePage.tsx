
import PageLayout from "@/components/layout/PageLayout";
import PostSwiper from "@/components/approve/PostSwiper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { usePostContext } from "@/contexts/PostContext";

const ApprovePage = () => {
  const { pendingPosts } = usePostContext();
  
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Approve Posts</h1>
          <p className="text-muted-foreground">
            Swipe right to approve, left to reject, or tap the buttons.
          </p>
        </div>
        
        <div className="flex justify-between mb-6">
          <Link to="/generate">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Generate More
            </Button>
          </Link>
          
          <Link to="/schedule">
            <Button size="sm">View Approved Posts</Button>
          </Link>
        </div>
        
        <PostSwiper />
        
        {pendingPosts.length > 0 && (
          <div className="text-center mt-6 text-sm text-muted-foreground">
            <p className="font-medium">👆 Swipe right to approve, left to reject 👆</p>
            <p>Or use the buttons below the post</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ApprovePage;
