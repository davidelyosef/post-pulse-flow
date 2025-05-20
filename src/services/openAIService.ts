
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
    console.log("API response data:", data);
    
    // More flexible response format handling - check for various possible formats
    let postsContent: string[] = [];
    
    // Handle different response formats
    if (Array.isArray(data)) {
      // Direct array of strings or objects
      postsContent = data.map(item => typeof item === 'string' ? item : JSON.stringify(item));
    } else if (typeof data === 'object' && data !== null) {
      // If it's an object with a data/posts/content property
      if (Array.isArray(data.data)) {
        postsContent = data.data;
      } else if (Array.isArray(data.posts)) {
        postsContent = data.posts;
      } else if (Array.isArray(data.content)) {
        postsContent = data.content;
      } else if (typeof data.content === 'string') {
        // Single content string, split by a delimiter
        postsContent = [data.content];
      } else {
        // Try to convert the object itself to a post
        postsContent = [JSON.stringify(data)];
      }
    } else if (typeof data === 'string') {
      // Single string response
      postsContent = [data];
    }
    
    console.log("Processed post content array:", postsContent);
    
    if (postsContent.length === 0) {
      console.error("Could not extract post content from API response");
      throw new Error("Could not extract post content from API response");
    }
    
    // Map the processed content to our Post type
    const posts: Post[] = postsContent.map((postContent: any) => {
      let content = '';
      
      // Ensure we have a string to work with
      if (typeof postContent === 'string') {
        content = postContent;
      } else if (postContent && typeof postContent === 'object') {
        // If it's an object, try to get the content or stringify it
        content = postContent.content || postContent.text || JSON.stringify(postContent);
      } else {
        console.warn("Skipping invalid post content:", postContent);
        return null;
      }
      
      if (!content.trim()) {
        return null;
      }
      
      // Extract a subject from the first line or use a default
      let subject = content.split('\n')[0];
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
        content: content,
        tags: postTags,
        createdAt: new Date(),
        status: "pending",
        tone: tone || undefined,
        style: style || undefined,
      };
    }).filter(Boolean) as Post[]; // Filter out any null values
    
    console.log("Generated posts:", posts);
    
    if (posts.length === 0) {
      throw new Error("No valid posts were generated");
    }
    
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
