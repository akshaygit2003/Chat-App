import { useState } from "react";
import useConversation from "../zustand/useConversation";
import { API_BASE_URL, getAuthHeaders } from "../utils/api";
import toast from "react-hot-toast";

const useVotePoll = () => {
  const [voting, setVoting] = useState(false);
  const { updatePoll } = useConversation();

  const voteOption = async (messageId, optionId) => {
    setVoting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/messages/poll-vote/${messageId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          credentials: "include",
          body: JSON.stringify({ optionId }),
        }
      );

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.poll) {
        updatePoll(messageId, data.poll);
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit vote");
    } finally {
      setVoting(false);
    }
  };

  return { voteOption, voting };
};

export default useVotePoll;
