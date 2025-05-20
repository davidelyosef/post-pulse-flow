
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Linkedin, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { isLinkedInConnected, connectToLinkedIn, disconnectLinkedIn, getLinkedInUser } from "@/services/linkedinService";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Navbar = () => {
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Check if the user is connected to LinkedIn
    const checkConnection = () => {
      const isConnected = isLinkedInConnected();
      setConnected(isConnected);
      
      if (isConnected) {
        const userData = getLinkedInUser();
        setUser(userData);
      }
    };
    
    checkConnection();
    
    // Add event listener for storage changes (in case user connects in another tab)
    window.addEventListener('storage', checkConnection);
    
    return () => {
      window.removeEventListener('storage', checkConnection);
    };
  }, []);
  
  const handleLinkedInButton = async () => {
    if (connected) {
      disconnectLinkedIn();
      setConnected(false);
      setUser(null);
    } else {
      const success = await connectToLinkedIn();
      if (success) {
        setConnected(true);
        setUser(getLinkedInUser());
      }
    }
  };

  const NavLinks = () => (
    <>
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
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Linkedin className="h-8 w-8 text-linkedin-blue" />
          <h1 className="text-2xl font-bold text-linkedin-blue">LinkedAI</h1>
        </Link>
        
        <div className="ml-auto flex items-center space-x-2">
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <NavLinks />
          </nav>
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[385px]">
              <nav className="flex flex-col gap-4 mt-8">
                <NavLinks />
                <Button 
                  variant={connected ? "default" : "outline"} 
                  className="mt-4 w-full" 
                  onClick={handleLinkedInButton}
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  {connected ? "Disconnect LinkedIn" : "Connect to LinkedIn"}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          
          <Button 
            variant={connected ? "default" : "outline"} 
            className="hidden sm:inline-flex gap-2 animate-fade-in" 
            onClick={handleLinkedInButton}
          >
            <Linkedin className="h-4 w-4" />
            {connected ? "Disconnect LinkedIn" : "Connect to LinkedIn"}
          </Button>
        </div>
      </div>
      
      {connected && user && (
        <div className="bg-muted/30 py-2 px-4 sm:px-6 lg:px-8 text-sm flex items-center justify-end">
          <span className="text-muted-foreground mr-2">Connected as:</span>
          <span className="font-medium">{user.name}</span>
        </div>
      )}
    </header>
  );
};

export default Navbar;
