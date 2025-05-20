
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Linkedin className="h-8 w-8 text-linkedin-blue" />
          <h1 className="text-2xl font-bold text-linkedin-blue">LinkedAI</h1>
        </Link>
        
        <div className="ml-auto flex items-center space-x-2">
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link to="/generate" className="text-sm font-medium transition-colors hover:text-primary">
              Generate
            </Link>
            <Link to="/approve" className="text-sm font-medium transition-colors hover:text-primary">
              Approve
            </Link>
            <Link to="/schedule" className="text-sm font-medium transition-colors hover:text-primary">
              Schedule
            </Link>
          </nav>
          
          <Button variant="outline" className="hidden sm:inline-flex">
            Connect to LinkedIn
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
