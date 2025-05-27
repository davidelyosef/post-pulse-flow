
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, Check, MessageSquarePlus } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import PageLayout from "@/components/layout/PageLayout";

const Index = () => {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-b from-background relative overflow-hidden">

        <header className="container mx-auto pt-8 md:pt-12 lg:pt-24 px-4 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <img src="/lovable-uploads/32e0f61b-66c1-46d2-b4a8-cb3c5d5c8757.png" alt="Moburst" className="h-8 w-8 md:h-10 md:w-10" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-linkedin-blue">Moburst LinkedAI</h1>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 max-w-2xl text-foreground">
            Create, filter, and schedule engaging LinkedIn posts in just 2 minutes a day
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl">
            Leverage AI to generate professional, personalized content for your LinkedIn profile. Approve posts with a simple swipe and
            schedule them for optimal engagement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/generate" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Start Creating <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/approve" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2 border-muted-foreground/30 dark:border-muted-foreground/70 dark:text-foreground"
              >
                Review Posts <Check className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>

        <section className="container mx-auto py-12 md:py-16 lg:py-24 px-4 relative z-10">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-8 md:mb-12 text-center text-foreground">
            Your 2-minute daily ritual for LinkedIn success
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-linkedin-blue/10 backdrop-blur-sm bg-background/80">
              <CardHeader>
                <div className="bg-linkedin-blue/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <MessageSquarePlus className="h-6 w-6 text-linkedin-blue" />
                </div>
                <CardTitle className="text-foreground">Generate</CardTitle>
                <CardDescription className="text-muted-foreground">Create AI-powered posts tailored to your style</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enter a topic, select your preferred style and tone, and let AI create engaging post ideas for your LinkedIn profile.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/generate">
                  <Button variant="ghost" size="sm" className="gap-1 text-foreground hover:text-foreground">
                    Generate posts <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="border-2 border-linkedin-blue/10 backdrop-blur-sm bg-background/80">
              <CardHeader>
                <div className="bg-linkedin-blue/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <Check className="h-6 w-6 text-linkedin-blue" />
                </div>
                <CardTitle className="text-foreground">Approve</CardTitle>
                <CardDescription className="text-muted-foreground">Swipe to keep only the best content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Review generated posts with our Tinder-style interface. Swipe right to approve great posts, left to discard ones that don't
                  resonate.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/approve">
                  <Button variant="ghost" size="sm" className="gap-1 text-foreground hover:text-foreground">
                    Review posts <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="border-2 border-linkedin-blue/10 backdrop-blur-sm bg-background/80">
              <CardHeader>
                <div className="bg-linkedin-blue/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-linkedin-blue" />
                </div>
                <CardTitle className="text-foreground">Schedule</CardTitle>
                <CardDescription className="text-muted-foreground">Plan your posts for maximum engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Schedule approved posts for optimal times or publish immediately. Connect with LinkedIn to automate your content strategy.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/schedule">
                  <Button variant="ghost" size="sm" className="gap-1 text-foreground hover:text-foreground">
                    Schedule posts <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Index;
