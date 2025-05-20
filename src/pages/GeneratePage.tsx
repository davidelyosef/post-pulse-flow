
import PageLayout from "@/components/layout/PageLayout";
import GenerateForm from "@/components/generate/GenerateForm";

const GeneratePage = () => {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Generate LinkedIn Posts</h1>
          <p className="text-muted-foreground">
            Create AI-powered LinkedIn content tailored to your style and needs.
          </p>
        </div>
        
        <GenerateForm />
      </div>
    </PageLayout>
  );
};

export default GeneratePage;
