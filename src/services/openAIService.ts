
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
    
    // Check if the response has a 'results' property
    if (data && data.results) {
      console.log("Found results property in API response:", data.results);
      
      // If results is an array, use it directly
      if (Array.isArray(data.results)) {
        const posts = data.results.map((item: any, index: number) => {
          let content = '';
          
          // Handle different content formats in results array
          if (typeof item === 'string') {
            content = item;
          } else if (typeof item === 'object' && item !== null) {
            // Try to get content from various properties
            content = item.content || item.text || item.post || JSON.stringify(item);
          }
          
          if (!content.trim()) {
            console.warn("Skipping empty post content:", item);
            return null;
          }
          
          const postTags = [];
          
          return {
            id: generateUniqueId(),
            content: content,
            tags: postTags,
            createdAt: new Date(),
            status: "pending",
            tone: tone || undefined,
            style: style || undefined,
          };
        }).filter(Boolean) as Post[];
        
        console.log("Generated posts from results array:", posts);
        
        if (posts.length === 0) {
          throw new Error("No valid posts were generated from results array");
        }
        
        return posts;
      }
      
      // If results is a string, create a single post
      if (typeof data.results === 'string') {
        const content = data.results;
        
        if (!content.trim()) {
          throw new Error("Empty post content received from results");
        }
        
        const tags = [];
        
        const post: Post = {
          id: generateUniqueId(),
          content: content,
          tags: tags,
          createdAt: new Date(),
          status: "pending",
          tone: tone || undefined,
          style: style || undefined,
        };
        
        console.log("Generated single post from results string:", post);
        
        return [post];
      }
      
      // If results is an object, try to extract content
      if (typeof data.results === 'object' && data.results !== null) {
        console.log("Results is an object, trying to extract content");
        
        // Try to get array data from the results object
        const resultsArray = data.results.posts || data.results.data || data.results.content || [data.results];
        
        if (Array.isArray(resultsArray)) {
          const posts = resultsArray.map((item: any, index: number) => {
            let content = '';
            
            if (typeof item === 'string') {
              content = item;
            } else if (typeof item === 'object' && item !== null) {
              content = item.content || item.text || item.post || JSON.stringify(item);
            }
            
            if (!content.trim()) {
              console.warn("Skipping empty post content from results object array:", item);
              return null;
            }
            
            const postTags = [];
            
            return {
              id: generateUniqueId(),
              content: content,
              tags: postTags,
              createdAt: new Date(),
              status: "pending",
              tone: tone || undefined,
              style: style || undefined,
            };
          }).filter(Boolean) as Post[];
          
          console.log("Generated posts from results object array:", posts);
          
          if (posts.length === 0) {
            throw new Error("No valid posts were generated from results object array");
          }
          
          return posts;
        }
      }
    }
    
    // Fallback to the original processing if no 'results' property found
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
    
    console.log("Processed post content array (fallback):", postsContent);
    
    if (postsContent.length === 0) {
      console.error("Could not extract post content from API response");
      throw new Error("Invalid response format from API");
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
      
      const postTags = [];
      
      return {
        id: generateUniqueId(),
        content: content,
        tags: postTags,
        createdAt: new Date(),
        status: "pending",
        tone: tone || undefined,
        style: style || undefined,
      };
    }).filter(Boolean) as Post[]; // Filter out any null values
    
    console.log("Generated posts (fallback):", posts);
    
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
