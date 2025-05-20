
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { generatePosts } from "@/services/openAIService";
import { usePostContext } from "@/contexts/PostContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const writingTones = [
  { id: "professional", name: "Professional", description: "Formal and business-like" },
  { id: "conversational", name: "Conversational", description: "Friendly and approachable" },
  { id: "inspiring", name: "Inspiring", description: "Motivational and uplifting" },
  { id: "educational", name: "Educational", description: "Informative and instructional" },
  { id: "humorous", name: "Humorous", description: "Light-hearted and entertaining" },
];

const writingStyles = [
  { id: "concise", name: "Concise", description: "Brief and to the point" },
  { id: "storytelling", name: "Storytelling", description: "Narrative and engaging" },
  { id: "analytical", name: "Analytical", description: "Data-driven and logical" },
  { id: "persuasive", name: "Persuasive", description: "Convincing and compelling" },
  { id: "thought-leadership", name: "Thought Leadership", description: "Visionary and authoritative" },
];

export const GenerateForm = () => {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [tone, setTone] = useState("professional");
  const [style, setStyle] = useState("concise");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { addPosts } = usePostContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsLoading(true);
    try {
      const posts = await generatePosts(count, topic, tone, style);
      addPosts(posts);
      toast.success(`Generated ${posts.length} posts!`);
      // Clear the form
      setTopic("");
      // Redirect to approve page
      navigate("/approve");
    } catch (error) {
      console.error("Error generating posts:", error);
      toast.error("Failed to generate posts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="topic">What would you like posts about?</Label>
        <Textarea
          id="topic"
          placeholder="e.g., Leadership tips, industry trends, career advice, etc."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="min-h-[100px]"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="count">Number of posts to generate</Label>
          <Input
            id="count"
            type="number"
            min={1}
            max={30}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tone">Writing tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger id="tone">
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              {writingTones.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} - {t.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="style">Writing style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger id="style">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {writingStyles.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} - {s.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
          </>
        ) : (
          "Generate LinkedIn Posts"
        )}
      </Button>
    </form>
  );
};

export default GenerateForm;
