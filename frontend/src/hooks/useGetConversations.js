import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../utils/api";
import { useAuthContext } from "../context/AuthContext";

const useGetConversations = () => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const { authUser, setAuthUser } = useAuthContext();

  useEffect(() => {
    const getConversations = async () => {
      if (!authUser) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/users`, {
          credentials: "include",
        });

        if (res.status === 401) {
          // Token expired or invalid: reset stale auth state cleanly
          localStorage.removeItem("chat-user");
          setAuthUser(null);
          return;
        }

        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setConversations(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      getConversations();
    }
  }, [authUser, setAuthUser]);

  return { loading, conversations };
};

export default useGetConversations;
