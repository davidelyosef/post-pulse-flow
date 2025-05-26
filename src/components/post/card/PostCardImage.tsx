
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, Loader2, RefreshCw } from "lucide-react";
import { Post } from "@/types";
import { generateImageFromPrompt } from "@/services/openAIService";
import { useUser } from "@/contexts/UserContext";

interface PostCardImageProps {
  post: Post;
  isGeneratingPrompts: boolean;
  isGeneratingImage: boolean;
  onGeneratePrompts: () => void;
  onSelectPrompt: (prompt: string) => void;
  onImageRegenerated?: (newImageUrl: string) => void;
}

export const PostCardImage = ({ 
  post, 
  isGeneratingPrompts, 
  onGeneratePrompts, 
  onSelectPrompt,
  onImageRegenerated
}: PostCardImageProps) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { getUserId } = useUser();

  const handleSelectPrompt = async (prompt: string) => {
    console.log("PostCardImage: Selecting prompt:", prompt);
    onSelectPrompt(prompt);
    
    if (!post.imageUrl) {
      console.log("PostCardImage: No existing image, generating new one...");
      setIsGeneratingImage(true);
      try {
        const imageUrl = await generateImageFromPrompt(prompt, getUserId());
        console.log("PostCardImage: Generated image URL:", imageUrl);
        
        if (imageUrl) {
          // Notify parent component with the new image URL
          console.log("PostCardImage: Calling onImageRegenerated with:", imageUrl);
          onImageRegenerated?.(imageUrl);
        }
      } catch (error) {
        console.error("Error generating image:", error);
      } finally {
        setIsGeneratingImage(false);
      }
    }
  };

  const handleRegenerateImage = async () => {
    // Use the selected prompt if available, otherwise use a default prompt
    const prompt = post.selectedImagePrompt || `Professional illustration related to ${post.content.substring(0, 100)}`;
    console.log("PostCardImage: Regenerating image with prompt:", prompt);
    
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateImageFromPrompt(prompt, getUserId());
      console.log("PostCardImage: Regenerated image URL:", imageUrl);
      
      if (imageUrl) {
        // Notify parent component with the new image URL
        console.log("PostCardImage: Calling onImageRegenerated with:", imageUrl);
        onImageRegenerated?.(imageUrl);
      }
    } catch (error) {
      console.error("Error regenerating image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  console.log("PostCardImage: Rendering with imageUrl:", post.imageUrl);

  if (post.imageUrl) {
    return (
      <div className="mt-6">
        <div className="relative">
          <img 
            src={post.imageUrl} 
            alt="Post visual" 
            className="rounded-lg w-full h-auto object-cover shadow-md"
          />
          {isGeneratingImage && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={handleRegenerateImage}
          disabled={isGeneratingImage}
        >
          {isGeneratingImage ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Different Image
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {isGeneratingPrompts ? (
        <div className="flex justify-center items-center p-8 border rounded-lg border-dashed">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Generating image ideas...</span>
        </div>
      ) : isGeneratingImage ? (
        <div className="flex justify-center items-center p-8 border rounded-lg border-dashed">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Generating image...</span>
        </div>
      ) : post.imagePrompts ? (
        <div className="space-y-3 overflow-hidden">
          <p className="text-sm font-medium">Select an image concept:</p>
          <div className="grid gap-2 overflow-y-auto max-h-52">
            {post.imagePrompts.map((prompt, index) => (
              <Button 
                key={index} 
                variant="outline" 
                className="justify-start text-left h-auto py-2 font-normal break-words whitespace-normal"
                onClick={() => handleSelectPrompt(prompt)}
                disabled={isGeneratingImage}
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  prompt
                )}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <Button 
          variant="outline" 
          className="w-full py-10 flex flex-col gap-2" 
          onClick={onGeneratePrompts}
        >
          <Image className="h-8 w-8 opacity-50" />
          <span>Generate image ideas</span>
        </Button>
      )}
    </div>
  );
};
