
export type Post = {
  id: string;
  content: string;
  createdAt: Date;
  subject?: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  imagePrompts?: string[];
  selectedImagePrompt?: string;
  imageUrl?: string;
  scheduledFor?: Date;
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
