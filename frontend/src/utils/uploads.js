/** Build absolute URL for a file stored in backend/uploads */
export const uploadsUrl = (filename) => {
  if (!filename) return null;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  return `${origin}/uploads/${encodeURIComponent(filename)}`;
};
