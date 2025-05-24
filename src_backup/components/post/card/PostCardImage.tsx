
import { Button } from "@/components/ui/button";
import { Image, Loader2 } from "lucide-react";
import { Post } from "@/types";
import { generateImage } from "@/services/linkedinService";
import { usePostContext } from "@/contexts/PostContext";

interface PostCardImageProps {
  post: Post;
  isGeneratingPrompts: boolean;
  isGeneratingImage: boolean;
  onGeneratePrompts: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const PostCardImage = ({ 
  post, 
  isGeneratingPrompts, 
  isGeneratingImage, 
  onGeneratePrompts, 
  onSelectPrompt 
}: PostCardImageProps) => {
  const { updatePost } = usePostContext();

  const handleSelectPrompt = async (prompt: string) => {
    onSelectPrompt(prompt);
    
    // If we don't yet have an image, generate one
    if (!post.imageUrl) {
      try {
        // Generate image using the selected prompt and post content
        const imageUrl = await generateImage(prompt, post.content);
        
        // If we got an image URL back, update the post with it
        if (imageUrl) {
          updatePost(post.id, { imageUrl });
        }
      } catch (error) {
        console.error("Error generating image:", error);
      }
    }
  };

  if (post.imageUrl) {
    return (
      <div className="mt-6">
        <img 
          src={post.imageUrl} 
          alt="Post visual" 
          className="rounded-lg w-full h-auto object-cover shadow-md"
        />
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
              >
                {prompt}
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
