
export const API_BASE_URL = "https://linkedai-server.moburst.com/api";

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const handleApiError = (error: any, operation: string) => {
  console.error(`${operation} error:`, error);
  throw error;
};
