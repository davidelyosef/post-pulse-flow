// This is a service for generating LinkedIn posts using the external API

import { Post } from "@/types";

const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const generatePosts = async (
  count: number = 5,
  topic?: string,
  tone?: string,
  style?: string
): Promise<Post[]> => {
  console.log(`Generating ${count} posts about "${topic}" with tone "${tone}" and style "${style}"`);
  
  try {
    // Call the LinkedIn posts generation API
    const response = await fetch("https://linkedai-backend.vercel.app/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: tone,
        description: topic,
        numberOfRequests: count
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Map the API response to our Post type
    const posts: Post[] = data.map((postContent: string) => {
      // Extract a subject from the first line or use a default
      let subject = postContent.split('\n')[0];
      if (subject.length > 60) {
        subject = subject.substring(0, 60) + '...';
      }
      
      // Generate some relevant tags based on the content
      const possibleTags = [
        "leadership", "innovation", "productivity", "career", "networking",
        "growth", "mindset", "technology", "future-of-work", "remote-work",
        "professional-development", "personal-branding", "team-building"
      ];
      
      const postTags = [];
      const numberOfTags = Math.floor(Math.random() * 3) + 2; // 2-4 tags
      
      for (let j = 0; j < numberOfTags; j++) {
        const randomTagIndex = Math.floor(Math.random() * possibleTags.length);
        const tag = possibleTags[randomTagIndex];
        if (!postTags.includes(tag)) {
          postTags.push(tag);
        }
      }
      
      return {
        id: generateUniqueId(),
        subject: subject,
        content: postContent,
        tags: postTags,
        createdAt: new Date(),
        status: "pending",
        tone: tone || undefined,
        style: style || undefined,
      };
    });
    
    return posts;
  } catch (error) {
    console.error("Error generating posts:", error);
    throw error;
  }
};

export const generateImagePrompts = async (postContent: string): Promise<string[]> => {
  // In a real app, this would be an API call to OpenAI
  
  // Create some contextually relevant image prompts based on common LinkedIn themes
  const basePrompts = [
    "A professional looking person writing on a laptop with a thoughtful expression",
    "Abstract visualization of networking connections with blue and white nodes",
    "A minimalist illustration showing growth and progress through simple graphs",
    "A person standing confidently at a podium presenting to an audience",
    "A clean, modern workspace with productivity tools and technology",
  ];

  // For a real implementation, we would analyze the post content to create relevant prompts
  
  return basePrompts;
};

export const generateImage = async (prompt: string): Promise<string> => {
  // In a real app, this would call an image generation API like DALL-E, Midjourney, etc.
  console.log("Generating image for prompt:", prompt);
  
  // For demo purposes, return a placeholder image
  // In production, this would call an AI image generation service
  
  const placeholderImages = [
    "https://via.placeholder.com/800x450/0077B5/ffffff?text=Professional+LinkedIn+Post",
    "https://via.placeholder.com/800x450/2867B2/ffffff?text=Career+Development",
    "https://via.placeholder.com/800x450/0A66C2/ffffff?text=Networking+Connections",
    "https://via.placeholder.com/800x450/0073B1/ffffff?text=Leadership+Insights",
    "https://via.placeholder.com/800x450/004182/ffffff?text=Industry+Trends"
  ];
  
  // Select a random placeholder image
  const randomIndex = Math.floor(Math.random() * placeholderImages.length);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(placeholderImages[randomIndex]);
    }, 2000); // Simulate API delay
  });
};
