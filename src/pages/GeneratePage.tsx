import PageLayout from "@/components/layout/PageLayout";
import GenerateForm from "@/components/generate/GenerateForm";
import { Button } from "@/components/ui/button";
import { connectToLinkedIn, isLinkedInConnected, getLinkedInUser, disconnectLinkedIn } from "@/services/linkedinService";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { usePostContext } from "@/contexts/PostContext";

const GeneratePage = () => {
  const [connected, setConnected] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { addPosts } = usePostContext();

  useEffect(() => {
    // Check LinkedIn connection status on component mount
    const checkConnection = async () => {
      setConnected(isLinkedInConnected());
      setUserData(getLinkedInUser());

      const urlParams = new URLSearchParams(window.location.search);

      if (urlParams.get("success") === "true") {
        console.log("Successfully connected to LinkedIn");
        try {
          // get request to the backend to get the user data
          const response = await fetch("https://34.226.170.38:3000/api/auth/success", { credentials: "include" });
          const data = await response.json();
          console.log("LinkedIn user data:", data);
          setUserData(data);

          // Store connection state in localStorage first
          if (!isLinkedInConnected) {
            localStorage.setItem("linkedinConnected", "true");
            localStorage.setItem("linkedinUser", JSON.stringify(data));
          }
        } catch (error) {
          console.error("Error fetching LinkedIn user data:", error);
        }
      }
    };

    let numberOfTimes = 0;

    const interval = setInterval(async () => {
      numberOfTimes++;
      checkConnection();
      let user: any = localStorage.getItem("linkedinUser");
      if (user) {
        clearInterval(interval);
        return;
      }
      if (numberOfTimes > 10) {
        clearInterval(interval);
      }
    }, 100);
  }, [addPosts]);

  const handleConnectLinkedIn = async () => {
    setLoading(true);
    try {
      await connectToLinkedIn();
      setConnected(true);
      setUserData(getLinkedInUser());
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectLinkedIn();
    setConnected(false);
    setUserData(null);
  };

  useEffect(() => {
    const linkedinUser = localStorage.getItem("linkedinUser");
    if (linkedinUser) {
      setUserData(JSON.parse(linkedinUser));
    }
  }, []);

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Generate LinkedIn Posts</h1>
          <p className="text-muted-foreground mb-6">Create AI-powered LinkedIn content tailored to your style and needs.</p>

          {/* Review Posts Link */}
          <div className="mb-4">
            <Link to="/approve" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80">
              Review your pending posts <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {/* LinkedIn Connection Status */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <h2 className="text-lg font-medium mb-2">LinkedIn Connection</h2>

            {connected ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-3 mb-3">
                  {userData?.profileUrl && <img src={userData.profileUrl} alt="Profile" className="w-10 h-10 rounded-full" />}
                  <div className="text-left">
                    <p className="font-medium">{userData?.displayName || "Connected User"}</p>
                    <p className="text-sm text-muted-foreground">{userData?.position || "LinkedIn User"}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleDisconnect}>
                  Disconnect LinkedIn
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="mb-3 text-muted-foreground">Connect your LinkedIn account to publish posts directly</p>
                <Button onClick={handleConnectLinkedIn} disabled={loading}>
                  {loading ? "Connecting..." : "Connect to LinkedIn"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <GenerateForm />
      </div>
    </PageLayout>
  );
};

export default GeneratePage;
