
import { API_BASE_URL, handleApiError } from "./apiConfig";

export const generateImageFromPrompt = async (
  prompt: string,
  userId: string,
  model: string = "dalle3"
): Promise<string> => {
  console.log("Generating image for prompt:", prompt);

  try {
    const response = await fetch(`${API_BASE_URL}/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        userId,
        model,
      }),
    });

    if (!response.ok) {
      throw new Error(`Image generation failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Image generation response:", data);

    if (!data.success || !data.imageUrl) {
      throw new Error("Failed to generate image");
    }

    return data.imageUrl;
  } catch (error) {
    handleApiError(error, "Image generation");
    throw error;
  }
};

export const generateImagePrompts = async (postContent: string): Promise<string[]> => {
  // Create some contextually relevant image prompts based on common LinkedIn themes
  const basePrompts = [
    "A professional looking person writing on a laptop with a thoughtful expression",
    "Abstract visualization of networking connections with blue and white nodes",
    "A minimalist illustration showing growth and progress through simple graphs",
    "A person standing confidently at a podium presenting to an audience",
    "A clean, modern workspace with productivity tools and technology",
  ];

  return basePrompts;
};

export const generateImage = async (prompt: string): Promise<string> => {
  // For demo purposes, return a placeholder image
  const placeholderImages = [
    "https://via.placeholder.com/800x450/0077B5/ffffff?text=Professional+LinkedIn+Post",
    "https://via.placeholder.com/800x450/2867B2/ffffff?text=Career+Development",
    "https://via.placeholder.com/800x450/0A66C2/ffffff?text=Networking+Connections",
    "https://via.placeholder.com/800x450/0073B1/ffffff?text=Leadership+Insights",
    "https://via.placeholder.com/800x450/004182/ffffff?text=Industry+Trends",
  ];

  const randomIndex = Math.floor(Math.random() * placeholderImages.length);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(placeholderImages[randomIndex]);
    }, 2000);
  });
};
