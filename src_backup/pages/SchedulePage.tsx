
import PageLayout from "@/components/layout/PageLayout";
import ScheduledPostList from "@/components/schedule/ScheduledPostList";

const SchedulePage = () => {
  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Manage Your Posts</h1>
          <p className="text-muted-foreground">
            Schedule, review, and publish your approved LinkedIn content.
          </p>
        </div>
        
        <ScheduledPostList />
      </div>
    </PageLayout>
  );
};

export default SchedulePage;
