/* eslint-disable react/prop-types */
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";
import Avatar from "../Avatar";

const Conversation = ({ conversation, lastIdx, emoji }) => {
  const { selectedConversation, setSelectedConversation } = useConversation();

  const isSelected = selectedConversation?._id === conversation._id;
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(conversation._id);

  return (
    <>
      <div
        className={`flex gap-3 items-center rounded-2xl p-2.5 cursor-pointer transition-all duration-150 ${
          isSelected
            ? "bg-blue-650/30 border border-blue-500/50 shadow-md shadow-blue-500/10"
            : "hover:bg-slate-800/70 border border-transparent"
        }`}
        onClick={() => setSelectedConversation(conversation)}
      >
        <Avatar
          name={conversation.fullName || conversation.username}
          src={conversation.profilePic}
          isOnline={isOnline}
          size="w-11 h-11 text-sm"
        />

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p
              className={`font-semibold text-sm truncate ${
                isSelected ? "text-blue-400" : "text-gray-200"
              }`}
            >
              {conversation.fullName}
            </p>
            <span className="text-base shrink-0">{emoji}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 mt-0.5">
            <span className="truncate max-w-[140px]">
              @{conversation.username}
            </span>
            {isOnline && (
              <span className="text-[10px] text-emerald-400 font-medium">
                online
              </span>
            )}
          </div>
        </div>
      </div>

      {!lastIdx && <div className="divider my-1 py-0 h-[1px] opacity-20" />}
    </>
  );
};

export default Conversation;
