import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../utils/api";

const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error("Google Sign-In failed to retrieve credentials.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      localStorage.setItem("chat-user", JSON.stringify(data));
      setAuthUser(data);
      toast.success(`Welcome back, ${data.fullName || data.username}!`);
    } catch (error) {
      toast.error(error.message || "Failed to authenticate with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Sign-In failed or was cancelled.");
  };

  return { loading, handleGoogleSuccess, handleGoogleError };
};

export default useGoogleAuth;
