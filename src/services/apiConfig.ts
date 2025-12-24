
export const API_BASE_URL = "https://34.226.170.38/api/generate";

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const handleApiError = (error: any, operation: string) => {
  console.error(`${operation} error:`, error);
  throw error;
};
