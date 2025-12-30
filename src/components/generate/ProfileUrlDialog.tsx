import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ProfileUrlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  userId: string;
  onSave: (newUrl: string) => void;
}

export const ProfileUrlDialog = ({ isOpen, onClose, currentUrl, userId, onSave }: ProfileUrlDialogProps) => {
  const [profileUrl, setProfileUrl] = useState(currentUrl);
  const [saving, setSaving] = useState(false);

  // Get profile URL from localStorage when dialog opens
  useEffect(() => {
    if (isOpen) {
      const linkedinUser = localStorage.getItem("linkedinUser");
      if (linkedinUser) {
        try {
          const parsedUser = JSON.parse(linkedinUser);
          const urlFromStorage = parsedUser.linkedinProfileUrl || parsedUser.profileUrl || parsedUser.profileUserUrl;
          if (urlFromStorage && urlFromStorage.trim() !== "") {
            setProfileUrl(urlFromStorage);
          } else if (currentUrl) {
            setProfileUrl(currentUrl);
          }
        } catch (error) {
          console.error("Error parsing linkedinUser from localStorage:", error);
          if (currentUrl) {
            setProfileUrl(currentUrl);
          }
        }
      } else if (currentUrl) {
        setProfileUrl(currentUrl);
      }
    }
  }, [isOpen, currentUrl]);

  const handleSave = async () => {
    if (!profileUrl.trim()) {
      toast.error("Please enter a valid LinkedIn profile URL");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("https://linkedai-server.moburst.com/api/auth/profile-url", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          profileUrl: profileUrl.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile URL");
      }

      onSave(profileUrl.trim());
      toast.success("Profile URL updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating profile URL:", error);
      toast.error("Failed to update profile URL");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update LinkedIn Profile URL</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="profileUrl">LinkedIn Profile URL</Label>
            <Input
              id="profileUrl"
              placeholder="https://www.linkedin.com/in/your-profile/"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};