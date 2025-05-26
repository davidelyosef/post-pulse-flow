
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { getUserPosts } from '@/services/postService';

interface User {
  id: string;
  linkedinId?: string;
  name?: string;
  displayName?: string;
  email?: string;
  profileUrl?: string;
  lastLogin?: string;
  linkedinConnected: boolean;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  getUserId: () => string;
  isAuthenticated: boolean;
  updateUserLinkedInStatus: (connected: boolean) => void;
  updateUserFromLinkedInAuth: (authData: any) => void;
  loadUserPosts: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Try to get user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    const linkedinUser = localStorage.getItem('linkedinUser');
    const linkedinConnected = localStorage.getItem('linkedinConnected') === 'true';

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (linkedinUser) {
      // Create user from LinkedIn data
      const userData = JSON.parse(linkedinUser);
      const newUser: User = {
        id: userData.id || userData.userId || userData._id?.$oid || 'default-user-id',
        linkedinId: userData.linkedinId,
        name: userData.displayName || userData.name,
        displayName: userData.displayName,
        email: userData.email,
        profileUrl: userData.profileUrl,
        lastLogin: userData.lastLogin,
        linkedinConnected,
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      // Create default user if none exists
      const defaultUser: User = {
        id: 'default-user-id',
        linkedinConnected: false,
      };
      setUser(defaultUser);
      localStorage.setItem('user', JSON.stringify(defaultUser));
    }
  }, []);

  useEffect(() => {
    // Save user to localStorage whenever it changes
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const getUserId = (): string => {
    return user?.id || 'default-user-id';
  };

  const updateUserLinkedInStatus = (connected: boolean) => {
    if (user) {
      setUser({ ...user, linkedinConnected: connected });
    }
  };

  const updateUserFromLinkedInAuth = (authData: any) => {
    if (authData && authData.user) {
      const userData = authData.user;
      const newUser: User = {
        id: userData.id || 'default-user-id',
        linkedinId: userData.linkedinId,
        name: userData.displayName,
        displayName: userData.displayName,
        email: userData.email,
        profileUrl: userData.profileUrl,
        lastLogin: userData.lastLogin,
        linkedinConnected: true,
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('linkedinUser', JSON.stringify(userData));
      localStorage.setItem('linkedinConnected', 'true');
      console.log('User context updated with LinkedIn auth data:', newUser);
    }
  };

  const loadUserPosts = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Loading posts for user:', user.id);
      const posts = await getUserPosts(user.id);
      console.log('Loaded posts:', posts);
      
      // Posts will be handled by PostContext
      return posts;
    } catch (error) {
      console.error('Error loading user posts:', error);
      toast.error('Failed to load your posts');
    }
  };

  const isAuthenticated = user !== null;

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        getUserId,
        isAuthenticated,
        updateUserLinkedInStatus,
        updateUserFromLinkedInAuth,
        loadUserPosts,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
