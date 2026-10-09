const rawUrl = (import.meta.env.VITE_BACKEND_URL || "").trim();

// Strip any trailing slash(es) so `${API_BASE_URL}/api/...` is always clean
export const API_BASE_URL = rawUrl.replace(/\/+$/, "");
