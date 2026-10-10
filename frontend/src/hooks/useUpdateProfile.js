import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import { API_BASE_URL, getAuthHeaders } from "../utils/api";

const useUpdateProfile = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const updateProfileDetails = async ({ fullName, bio, gender }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ fullName, bio, gender }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAuthUser((prev) => {
        const updatedUser = { ...(prev || {}), ...data };
        localStorage.setItem("chat-user", JSON.stringify(updatedUser));
        return updatedUser;
      });
      toast.success("Profile updated successfully!");
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (file) => {
    if (!file) {
      toast.error("Please select an image file");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${API_BASE_URL}/api/users/profile/avatar`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
        },
        body: formData,
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAuthUser((prev) => {
        const updatedUser = { ...(prev || {}), ...data };
        localStorage.setItem("chat-user", JSON.stringify(updatedUser));
        return updatedUser;
      });
      toast.success("Profile picture updated!");
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to update profile picture");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, updateProfileDetails, updateAvatar };
};

export default useUpdateProfile;
