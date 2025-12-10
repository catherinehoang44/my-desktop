// Utility function to get public asset path
// Handles cases where PUBLIC_URL might be empty or undefined
export const getPublicPath = (path) => {
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Get PUBLIC_URL, defaulting to empty string if undefined
  const publicUrl = process.env.PUBLIC_URL || '';
  // If PUBLIC_URL is empty, just return path with leading slash
  if (!publicUrl) {
    return `/${cleanPath}`;
  }
  // Otherwise, combine them (ensuring no double slashes)
  const baseUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
  return `${baseUrl}/${cleanPath}`;
};

