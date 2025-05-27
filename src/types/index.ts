
export type Post = {
  id: string;
  content: string;
  createdAt: Date;
  subject?: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected' | 'published';
  imagePrompts?: string[];
  selectedImagePrompt?: string;
  imageUrl?: string;
  scheduledFor?: Date;
  publishedAt?: Date;
  tone?: string;
  style?: string;
  analytics?: {
    likes?: number;
    comments?: number;
    views?: number;
  };
};

export type WritingStyle = {
  id: string;
  name: string;
  description: string;
};

export type WritingTone = {
  id: string;
  name: string;
  description: string;
};
