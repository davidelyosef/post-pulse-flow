import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Loader2, RefreshCw, PenLine } from "lucide-react";
import { Post } from "@/types";
import { generateImageFromPrompt } from "@/services/openAIService";
import { useUser } from "@/contexts/UserContext";
import { usePostContext } from "@/contexts/PostContext";

interface ImagePromptSelectorProps {
  prompts: string[];
  isGeneratingImage: boolean;
  onSelectPrompt: (prompt: string) => void;
}

const ImagePromptSelector = ({ prompts, isGeneratingImage, onSelectPrompt }: ImagePromptSelectorProps) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const handleCustomSubmit = () => {
    if (customPrompt.trim()) {
      onSelectPrompt(customPrompt.trim());
      setCustomPrompt("");
      setShowCustomInput(false);
    }
  };

  return (
    <div className="space-y-3 overflow-hidden">
      <p className="text-sm font-medium">Select an image concept:</p>
      <div className="grid gap-2 overflow-y-auto max-h-52">
        {prompts.map((prompt, index) => (
          <Button 
            key={index} 
            variant="outline" 
            className="justify-start text-left h-auto py-2 font-normal break-words whitespace-normal"
            onClick={() => onSelectPrompt(prompt)}
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
      
      {showCustomInput ? (
        <div className="flex gap-2">
          <Input
            placeholder="Write your own image concept..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            disabled={isGeneratingImage}
            className="flex-1"
          />
          <Button 
            size="sm" 
            onClick={handleCustomSubmit}
            disabled={isGeneratingImage || !customPrompt.trim()}
          >
            Generate
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowCustomInput(false)}
            disabled={isGeneratingImage}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => setShowCustomInput(true)}
          disabled={isGeneratingImage}
        >
          <PenLine className="h-4 w-4 mr-2" />
          Write my own concept
        </Button>
      )}
    </div>
  );
};

interface PostCardImageProps {
  post: Post;
  isGeneratingPrompts: boolean;
  isGeneratingImage: boolean;
  onGeneratePrompts: () => void;
  onSelectPrompt: (prompt: string) => void;
  onImageRegenerated?: (newImageUrl: string) => void;
  content?: string; // Optional content override for prompt generation
}

export const PostCardImage = ({ 
  post, 
  isGeneratingPrompts, 
  onGeneratePrompts, 
  onSelectPrompt,
  onImageRegenerated,
  content
}: PostCardImageProps) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { getUserId } = useUser();
  const { updatePostImage } = usePostContext();

  // Use provided content override or fall back to post.content
  const postContent = content || post.content;

  const createFullPrompt = (imageConcept: string) => {
    return `The image concept/style of this post should look like: ${imageConcept} || The post content is: ${postContent} || The image concept/style of this post should look like: ${imageConcept}`;
  };

  const handleSelectPrompt = async (prompt: string) => {
    console.log("PostCardImage: Selecting prompt:", prompt);
    onSelectPrompt(prompt);
    
    if (!post.imageUrl) {
      console.log("PostCardImage: No existing image, generating new one...");
      setIsGeneratingImage(true);
      try {
        const fullPrompt = createFullPrompt(prompt);
        console.log("PostCardImage: Full prompt for image generation:", fullPrompt);
        const imageUrl = await generateImageFromPrompt(fullPrompt, getUserId());
        console.log("PostCardImage: Generated image URL:", imageUrl);
        
        if (imageUrl) {
          // Update the post in context immediately
          updatePostImage(post.id, imageUrl);
          
          // Also notify parent component if callback is provided
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
    const imageConcept = post.selectedImagePrompt || `Professional illustration related to ${postContent.substring(0, 100)}`;
    const fullPrompt = createFullPrompt(imageConcept);
    console.log("PostCardImage: Regenerating image with full prompt:", fullPrompt);
    
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateImageFromPrompt(fullPrompt, getUserId());
      console.log("PostCardImage: Regenerated image URL:", imageUrl);
      
      if (imageUrl) {
        // Update the post in context immediately
        updatePostImage(post.id, imageUrl);
        
        // Also notify parent component if callback is provided
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
      ) : post.imagePrompts?.length ? (
        <ImagePromptSelector
          prompts={post.imagePrompts}
          isGeneratingImage={isGeneratingImage}
          onSelectPrompt={handleSelectPrompt}
        />
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
