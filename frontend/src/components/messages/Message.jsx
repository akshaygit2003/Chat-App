/* eslint-disable react/prop-types */
import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";
import Avatar from "../Avatar";
import VoicePlayer from "./VoicePlayer";
import PollMessage from "./PollMessage";
import LocationMessage from "./LocationMessage";
import { BsCheck, BsCheckAll, BsDownload } from "react-icons/bs";
import { BiTime } from "react-icons/bi";

const Message = ({ message }) => {
  const { authUser } = useAuthContext();
  const { selectedConversation } = useConversation();
  const fromMe = message.senderId === authUser._id;
  const formattedTime = extractTime(message.createdAt);
  const chatClassName = fromMe ? "chat-end" : "chat-start";
  const profilePic = fromMe
    ? authUser.profilePic
    : selectedConversation?.profilePic;
  const senderName = fromMe
    ? authUser?.fullName || authUser?.username
    : selectedConversation?.fullName || selectedConversation?.username;

  const bubbleBgColor = fromMe ? "bg-blue-600" : "bg-slate-800";
  const shakeClass = message.shouldShake ? "shake" : "";

  const handleDownloadImage = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(message.image);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `chat-photo-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(message.image, "_blank");
    }
  };

  const renderStatus = () => {
    if (!fromMe) return null;

    if (message.status === "sending") {
      return <BiTime className="w-3 h-3 text-gray-300" title="Sending..." />;
    }
    if (message.status === "read") {
      return (
        <BsCheckAll
          className="w-4 h-4 text-cyan-300 font-bold"
          title="Read"
        />
      );
    }
    if (message.status === "delivered") {
      return (
        <BsCheckAll
          className="w-4 h-4 text-gray-300"
          title="Delivered"
        />
      );
    }
    return <BsCheck className="w-4 h-4 text-gray-300" title="Sent" />;
  };

  return (
    <div className={`chat ${chatClassName} my-1.5`}>
      <Avatar
        className="chat-image"
        name={senderName}
        src={profilePic}
        size="w-9 h-9 text-xs"
      />

      <div
        className={`chat-bubble text-white ${bubbleBgColor} ${shakeClass} p-2.5 max-w-[88%] sm:max-w-[75%] md:max-w-md rounded-2xl shadow-md border border-slate-700/50 break-words`}
      >
        {/* 1. Voice Note Message */}
        {message.messageType === "voice" && message.audio && (
          <VoicePlayer
            audioUrl={message.audio}
            duration={message.audioDuration}
          />
        )}

        {/* 2. WhatsApp Poll Message */}
        {message.messageType === "poll" && message.poll && (
          <PollMessage messageId={message._id} poll={message.poll} />
        )}

        {/* 3. Location Message */}
        {message.messageType === "location" && message.location && (
          <LocationMessage location={message.location} />
        )}

        {/* 4. Image Attachment */}
        {message.image && (
          <div className="relative group mb-1.5 overflow-hidden rounded-xl bg-black/30">
            <img
              src={message.image}
              alt="Shared attachment"
              className="max-h-60 sm:max-h-80 w-full object-cover rounded-xl transition duration-200 group-hover:scale-[1.02]"
              loading="lazy"
            />
            {/* 1-Click Download Button */}
            <button
              onClick={handleDownloadImage}
              className="absolute bottom-2 right-2 p-2 bg-black/70 hover:bg-black/90 text-white rounded-full backdrop-blur-md opacity-90 transition-all shadow-md group-hover:opacity-100"
              title="Download photo"
            >
              <BsDownload className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 5. Text Message (if present) */}
        {message.message && message.messageType !== "poll" && (
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed px-1">
            {message.message}
          </p>
        )}
      </div>

      {/* Footer with timestamp and status ticks */}
      <div className="chat-footer text-gray-400 text-[11px] flex items-center gap-1 mt-0.5 px-1">
        <span>{formattedTime}</span>
        {renderStatus()}
      </div>
    </div>
  );
};

export default Message;
