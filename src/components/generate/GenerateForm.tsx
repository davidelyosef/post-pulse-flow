
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, ChevronDown } from "lucide-react";
import { generatePosts } from "@/services/openAIService";
import { usePostContext } from "@/contexts/PostContext";
import { useUser } from "@/contexts/UserContext";
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

const postGoals = [
  { id: "networking", name: "Networking / Build relationships" },
  { id: "job-search", name: "Job search / Open to opportunities" },
  { id: "milestone", name: "Personal milestone / Achievement" },
  { id: "portfolio", name: "Project showcase / Portfolio" },
  { id: "educational", name: "Educational / Share learnings" },
  { id: "gratitude", name: "Community / Give credit / Gratitude" },
  { id: "company-update", name: "Company / Product update (value-first)" },
  { id: "hiring", name: "Hiring / Recruiting" },
  { id: "other-goal", name: "Other" },
];

const targetAudiences = [
  { id: "hr-recruiters", name: "HR / Recruiters" },
  { id: "hiring-managers", name: "Hiring Managers (Data / Product / Engineering)" },
  { id: "data-analytics", name: "Data / Analytics community" },
  { id: "product-pm", name: "Product / PM / Growth" },
  { id: "founders", name: "Founders / Startups" },
  { id: "students-juniors", name: "Students / Juniors" },
  { id: "other-audience", name: "Other" },
];

export const GenerateForm = () => {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(3);
  const [tone, setTone] = useState("professional");
  const [style, setStyle] = useState("concise");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addPosts } = usePostContext();
  const { getUserId } = useUser();

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId) 
        : [...prev, goalId]
    );
  };

  const toggleAudience = (audienceId: string) => {
    setSelectedAudiences(prev => 
      prev.includes(audienceId) 
        ? prev.filter(id => id !== audienceId) 
        : [...prev, audienceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsLoading(true);

    // Build the enriched description with goals and audience
    const goalNames = selectedGoals.map(id => postGoals.find(g => g.id === id)?.name).filter(Boolean);
    const audienceNames = selectedAudiences.map(id => targetAudiences.find(a => a.id === id)?.name).filter(Boolean);
    
    let enrichedTopic = "";
    if (goalNames.length > 0) {
      enrichedTopic += `The purpose of this post is to: ${goalNames.join(", ")}.\n\n`;
    }
    if (audienceNames.length > 0) {
      enrichedTopic += `The target audience for this post are: ${audienceNames.join(", ")}.\n\n`;
    }
    enrichedTopic += topic;

    try {
      const posts = await generatePosts(count, enrichedTopic, tone, style, false, "dalle3");

      if (posts && Array.isArray(posts) && posts.length > 0) {
        console.log("Adding posts to context:", posts);
        addPosts(posts);
        toast.success(`Generated ${posts.length} posts!`);
        setTopic("");
        setSelectedGoals([]);
        setSelectedAudiences([]);
        navigate("/approve");
      } else {
        console.error("Invalid posts data received:", posts);
        toast.error("Failed to generate posts. Please try again.");
      }
    } catch (error) {
      console.error("Error generating posts:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate posts. Please try again.");
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

      {/* Post Goal and Target Audience - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Post Goal</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between font-normal"
              >
                <span className="truncate">
                  {selectedGoals.length > 0
                    ? `${selectedGoals.length} selected`
                    : "Select goals..."}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-3 bg-popover z-50" align="start">
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {postGoals.map((goal) => (
                  <div key={goal.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`goal-${goal.id}`}
                      checked={selectedGoals.includes(goal.id)}
                      onCheckedChange={() => toggleGoal(goal.id)}
                    />
                    <label
                      htmlFor={`goal-${goal.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {goal.name}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Target Audience</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between font-normal"
              >
                <span className="truncate">
                  {selectedAudiences.length > 0
                    ? `${selectedAudiences.length} selected`
                    : "Select audience..."}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-3 bg-popover z-50" align="start">
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {targetAudiences.map((audience) => (
                  <div key={audience.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`audience-${audience.id}`}
                      checked={selectedAudiences.includes(audience.id)}
                      onCheckedChange={() => toggleAudience(audience.id)}
                    />
                    <label
                      htmlFor={`audience-${audience.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {audience.name}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="count">Number of posts to generate</Label>
          <Input
            id="count"
            type="number"
            min={1}
            max={5}
            value={count}
            onChange={(e) => setCount(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
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
