
/**
 * Extract hashtags from content and return them in camel case format
 * @param content The content to extract hashtags from
 * @returns Array of hashtags in camel case format
 */
export function extractHashtags(content: string): string[] {
  // Match all hashtags in the content
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex);
  
  if (!matches) return [];
  
  // Convert matches to camel case and remove the # symbol
  return matches.map(tag => tag.substring(1));
}

/**
 * Remove hashtags from content
 * @param content The content containing hashtags
 * @returns Content with hashtags removed
 */
export function removeHashtags(content: string): string {
  // Replace all hashtags with empty string
  return content.replace(/#\w+\b/g, '').replace(/\s+/g, ' ').trim();
}
