const rawUrl = (import.meta.env.VITE_BACKEND_URL || "").trim();

// Strip any trailing slash(es) so `${API_BASE_URL}/api/...` is always clean
export const API_BASE_URL = rawUrl.replace(/\/+$/, "");

export const getAuthHeaders = () => {
  try {
    const user = JSON.parse(localStorage.getItem("chat-user") || "{}");
    if (user?.token) {
      return { Authorization: `Bearer ${user.token}` };
    }
  } catch {
    // ignore json parsing errors
  }
  return {};
};
