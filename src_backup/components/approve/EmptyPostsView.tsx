
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const EmptyPostsView = () => {
  return (
    <Card className="p-6 text-center">
      <p className="text-muted-foreground mb-4">No pending posts to review</p>
      <Button variant="outline" onClick={() => window.location.href = "/generate"}>
        Generate New Posts
      </Button>
    </Card>
  );
};
