
import { API_BASE_URL, handleApiError } from "./apiConfig";

export const savePostWithImage = async (
  description: string,
  userId: string,
  imageUrl?: string
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/saveimage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        userId,
        imageUrl: imageUrl || false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Save post failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to save post");
    }

    return data.post;
  } catch (error) {
    handleApiError(error, "Save post");
    throw error;
  }
};

export const getUserPosts = async (userId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Get user posts failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to get user posts");
    }

    return data.posts;
  } catch (error) {
    handleApiError(error, "Get user posts");
    throw error;
  }
};

export const updatePost = async (
  postId: string,
  userId: string,
  updates: {
    description?: string;
    imageUrl?: string;
    scheduleTime?: string;
  }
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/update/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...updates,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Update post failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to update post");
    }

    return data.post;
  } catch (error) {
    handleApiError(error, "Update post");
    throw error;
  }
};

export const deletePost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete/${postId}?userId=${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Delete post failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to delete post");
    }

    return true;
  } catch (error) {
    handleApiError(error, "Delete post");
    throw error;
  }
};

export const removeSchedule = async (postId: string, userId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/remove-schedule/${postId}?userId=${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Remove schedule failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to remove schedule");
    }

    return data.post;
  } catch (error) {
    handleApiError(error, "Remove schedule");
    throw error;
  }
};
