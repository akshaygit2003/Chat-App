import { useEffect } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import Avatar from "../Avatar";

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation, isTyping } =
    useConversation();
  const { onlineUsers } = useSocketContext();
  const isOnline = selectedConversation
    ? onlineUsers.includes(selectedConversation._id)
    : false;

  useEffect(() => {
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);

  return (
    <div className="md:min-w-[450px] flex flex-col flex-1">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          {/* Active Chat Header */}
          <div className="bg-slate-700/80 backdrop-blur-md px-4 py-2.5 mb-2 flex items-center justify-between border-b border-slate-600/50">
            <div className="flex items-center gap-3">
              <Avatar
                name={
                  selectedConversation.fullName ||
                  selectedConversation.username
                }
                src={selectedConversation.profilePic}
                isOnline={isOnline}
                size="w-9 h-9 text-xs"
              />
              <div className="flex flex-col">
                <span className="text-gray-100 font-bold text-sm tracking-wide">
                  {selectedConversation.fullName}
                </span>
                {isTyping ? (
                  <span className="text-blue-400 text-xs animate-pulse font-medium">
                    typing...
                  </span>
                ) : isOnline ? (
                  <span className="text-emerald-400 text-xs font-medium">
                    Online
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">Offline</span>
                )}
              </div>
            </div>
          </div>

          <Messages />
          <MessageInput />
        </>
      )}
    </div>
  );
};

export default MessageContainer;

const NoChatSelected = () => {
  const { authUser } = useAuthContext();
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2">
        <Avatar
          name={authUser?.fullName || authUser?.username}
          src={authUser?.profilePic}
          size="w-16 h-16 text-xl"
        />
        <p>Welcome 👋 {authUser?.fullName}</p>
        <p className="text-sm font-normal text-gray-400">
          Select a conversation from the sidebar to start chatting
        </p>
        <TiMessages className="text-3xl md:text-6xl text-blue-400 mt-2" />
      </div>
    </div>
  );
};
