
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
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Approve Posts</h1>
          <p className="text-muted-foreground">
            Swipe right to approve, left to reject, or tap the buttons.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
          <Link to="/generate">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 hover-scale">
              <ArrowLeft className="h-4 w-4" /> Generate More
            </Button>
          </Link>
          
          <Link to="/schedule">
            <Button size="sm" className="hover-scale w-full sm:w-auto">View Approved Posts</Button>
          </Link>
        </div>
        
        <PostSwiper />
      </div>
    </PageLayout>
  );
};

export default ApprovePage;
