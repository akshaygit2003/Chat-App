import { useEffect } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { IoArrowBack } from "react-icons/io5";
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
    <div
      className={`flex-1 flex-col h-full min-h-0 bg-transparent ${
        !selectedConversation ? "hidden sm:flex" : "flex w-full"
      }`}
    >
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          {/* Active Chat Header */}
          <div className="bg-gray-800/40 backdrop-blur-md px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between border-b border-slate-700/40 shadow-sm z-10">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Mobile Back Button */}
              <button
                onClick={() => setSelectedConversation(null)}
                className="sm:hidden p-1.5 -ml-1 text-gray-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Back to chats"
              >
                <IoArrowBack className="w-5 h-5" />
              </button>

              <div className="relative shrink-0">
                <Avatar
                  name={
                    selectedConversation.fullName ||
                    selectedConversation.username
                  }
                  src={selectedConversation.profilePic}
                  isOnline={isOnline}
                  size="w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-gray-100 font-bold text-sm tracking-wide truncate">
                  {selectedConversation.fullName}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isTyping ? (
                    <span className="text-blue-400 text-xs font-semibold animate-pulse">
                      typing...
                    </span>
                  ) : isOnline ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                      Online
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400">Offline</span>
                  )}
                </div>
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
    <div className="hidden sm:flex flex-col items-center justify-center w-full h-full p-8 text-center bg-transparent">
      <div className="p-6 rounded-3xl bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-slate-600/30 shadow-2xl max-w-sm flex flex-col items-center gap-3 animate-fadeIn">
        <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 shadow-inner">
          <TiMessages className="w-12 h-12" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-wide">
          Welcome, {authUser?.fullName || authUser?.username}!
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
          Select a chat from the sidebar to send messages, share voice notes,
          create WhatsApp polls, or send photos.
        </p>
      </div>
    </div>
  );
};
