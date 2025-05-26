
import { Post } from "@/types";
import { API_BASE_URL, generateUniqueId, handleApiError } from "./apiConfig";

export const generatePosts = async (
  count: number = 5,
  topic?: string,
  tone?: string,
  style?: string,
  generateImage: boolean = false,
  imageModel: string = "dalle3"
): Promise<Post[]> => {
  console.log(`Generating ${count} posts about "${topic}" with tone "${tone}" and style "${style}"`);

  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: tone,
        description: topic,
        numberOfRequests: count,
        generateImage,
        imageModel,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("API response data:", data);

    if (!data.success || !data.results) {
      throw new Error("Invalid response format from API");
    }

    const posts: Post[] = data.results.map((item: any) => {
      const content = item.content || "";
      
      if (!content.trim()) {
        throw new Error("Empty post content received");
      }

      return {
        id: generateUniqueId(),
        content: content,
        tags: [],
        createdAt: new Date(),
        status: "pending",
        tone: tone || undefined,
        style: style || undefined,
        imageUrl: item.imageUrl || undefined,
        imagePrompt: item.imagePrompt || undefined,
      };
    });

    console.log("Generated posts:", posts);

    if (posts.length === 0) {
      throw new Error("No valid posts were generated");
    }

    return posts;
  } catch (error) {
    handleApiError(error, "Generate posts");
    throw error;
  }
};

// Re-export functions from other services for backward compatibility
export { generateImageFromPrompt, generateImagePrompts, generateImage } from "./imageService";
export { savePostWithImage, getUserPosts, updatePost, deletePost } from "./postService";
