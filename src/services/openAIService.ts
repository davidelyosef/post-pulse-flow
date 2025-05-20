
// This is a mock service for OpenAI integration
// In a real app, this would call the actual OpenAI API

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
  
  // In a real app, this would be an API call to OpenAI
  // For now, we're returning mock data
  
  const mockSubjects = [
    "Leadership in the Digital Age",
    "Remote Work Productivity Tips",
    "Personal Branding Strategies",
    "Career Development Insights",
    "Networking Best Practices",
    "Industry Trends for 2025",
    "Work-Life Balance",
    "Professional Growth Mindset",
    "Innovation in the Workplace",
    "Team Building Strategies",
  ];
  
  const mockTags = [
    "leadership", "innovation", "productivity", "career", "networking",
    "growth", "mindset", "technology", "future-of-work", "remote-work",
    "professional-development", "personal-branding", "team-building"
  ];
  
  const mockContents = [
    "Success isn't about avoiding failure; it's about embracing the lessons it teaches us. In my 15 years of leadership, I've learned that our most significant breakthroughs often come directly after our biggest setbacks. What's a lesson from failure that changed your professional trajectory?",
    
    "Three productivity techniques that transformed my remote work experience:\n\n1. Time blocking: Schedule focused work sessions with no distractions\n2. The 2-minute rule: If it takes less than 2 minutes, do it immediately\n3. Weekly reflection: Review what worked and what didn't\n\nWhich productivity hacks have worked for you?",
    
    "Your personal brand isn't just what you post online—it's the consistent experience people have when they interact with you. Are you intentionally crafting this experience, or leaving it to chance?",
    
    "Career advice I wish I'd received earlier: Technical skills get you hired, but people skills get you promoted. Have you found this to be true in your industry?",
    
    "True networking isn't about collecting connections—it's about cultivating relationships. Quality always trumps quantity when it comes to building a professional network that supports your growth.",
    
    "AI isn't replacing jobs; it's replacing tasks. The professionals who will thrive in the coming decade are those who learn to collaborate with AI rather than compete against it. How are you adapting your skillset?",
    
    "The secret to work-life balance isn't balance at all—it's integration. When your career aligns with your values and purpose, the boundary between 'work' and 'life' becomes less defined, and both become more fulfilling.",
    
    "Growth happens at the edge of discomfort. Every time you take on a challenge that makes you nervous, you're expanding your capabilities and preparing yourself for bigger opportunities. What uncomfortable challenge are you tackling this quarter?",
    
    "Innovation rarely comes from having more resources. It comes from having more constraints. When you're forced to solve problems with limited resources, you develop creative solutions that wouldn't emerge in conditions of abundance.",
    
    "The strongest teams aren't built on talent alone—they're built on psychological safety. When team members feel safe to take risks and be vulnerable, collaboration and innovation flourish naturally."
  ];

  const posts: Post[] = [];
  
  for (let i = 0; i < count; i++) {
    // Select random content, subject, and tags for mock data
    const randomSubjectIndex = Math.floor(Math.random() * mockSubjects.length);
    const randomContentIndex = Math.floor(Math.random() * mockContents.length);
    
    // Generate 2-4 random tags
    const numberOfTags = Math.floor(Math.random() * 3) + 2;
    const postTags: string[] = [];
    for (let j = 0; j < numberOfTags; j++) {
      const randomTagIndex = Math.floor(Math.random() * mockTags.length);
      const tag = mockTags[randomTagIndex];
      if (!postTags.includes(tag)) {
        postTags.push(tag);
      }
    }
    
    posts.push({
      id: generateUniqueId(),
      subject: mockSubjects[randomSubjectIndex],
      content: mockContents[randomContentIndex],
      tags: postTags,
      createdAt: new Date(),
      status: "pending",
      tone: tone || undefined,
      style: style || undefined,
    });
  }
  
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      resolve(posts);
    }, 1500);
  });
};

export const generateImagePrompts = async (postContent: string): Promise<string[]> => {
  // In a real app, this would be an API call to OpenAI
  // For now, we're returning mock prompts
  
  return [
    "A professional looking person writing on a laptop with a thoughtful expression",
    "Abstract visualization of networking connections with blue and white nodes",
    "A minimalist illustration showing growth and progress through simple graphs",
    "A person standing confidently at a podium presenting to an audience",
    "A clean, modern workspace with productivity tools and technology",
  ];
};
