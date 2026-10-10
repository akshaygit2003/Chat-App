import { useState, useRef, useEffect } from "react";
import {
  BsSend,
  BsImage,
  BsMic,
  BsTrash,
  BsPlusCircle,
  BsEmojiSmile,
} from "react-icons/bs";
import { MdClose, MdLocationOn } from "react-icons/md";
import { FaPoll } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import useSendMessage from "../../hooks/useSendMessage";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";
import PollModal from "./PollModal";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Attachment menu, emoji picker & poll modal states
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const attachMenuRef = useRef(null);

  const { loading, sendMessage } = useSendMessage();
  const { socket } = useSocketContext();
  const { selectedConversation } = useConversation();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(e.target)
      ) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (socket && selectedConversation) {
      socket.emit("typing", { receiverId: selectedConversation._id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { receiverId: selectedConversation._id });
      }, 1500);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be smaller than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
    setShowAttachMenu(false);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 1. Voice Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      toast.error("Microphone access denied or not available");
    }
  };

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    mediaRecorderRef.current.onstop = async () => {
      clearInterval(recordingTimerRef.current);
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      // Stop mic tracks
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());

      setIsRecording(false);
      const dur = recordingDuration;
      setRecordingDuration(0);

      await sendMessage({
        audioBlob,
        audioDuration: dur,
      });
    };

    mediaRecorderRef.current.stop();
  };

  const cancelRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    clearInterval(recordingTimerRef.current);
    mediaRecorderRef.current.onstop = () => {
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    };
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setRecordingDuration(0);
    audioChunksRef.current = [];
  };

  // 2. Location Sharing Handler
  const handleShareLocation = () => {
    setShowAttachMenu(false);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.loading("Locating your coordinates...", { id: "geo-toast" });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        toast.dismiss("geo-toast");
        const { latitude, longitude } = pos.coords;
        await sendMessage({
          location: {
            latitude,
            longitude,
            address: "Live Location",
          },
        });
        toast.success("Location shared!");
      },
      (err) => {
        toast.dismiss("geo-toast");
        toast.error(`Location error: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // 3. Poll Creation Handler
  const handleCreatePoll = async (pollData) => {
    await sendMessage({
      poll: pollData,
    });
    toast.success("Poll created!");
  };

  // 4. Standard Text/Image Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;

    if (socket && selectedConversation) {
      socket.emit("stopTyping", { receiverId: selectedConversation._id });
    }

    const imgToSend = selectedImage;
    const msgToSend = message;

    setMessage("");
    removeSelectedImage();
    setShowEmojiPicker(false);

    await sendMessage({
      messageText: msgToSend,
      imageFile: imgToSend,
    });
  };

  const formatSecs = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="relative px-2 sm:px-4 my-2">
      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-16 left-2 sm:left-4 right-2 sm:right-auto z-50 shadow-2xl rounded-2xl border border-slate-700 overflow-hidden max-w-[calc(100vw-1rem)] sm:max-w-[340px]"
        >
          <EmojiPicker
            theme="dark"
            onEmojiClick={handleEmojiClick}
            lazyLoadEmojis
            searchPlaceHolder="Search emoji..."
            width="100%"
            height={350}
          />
        </div>
      )}

      {/* Attachment Menu Popup */}
      {showAttachMenu && (
        <div
          ref={attachMenuRef}
          className="absolute bottom-16 left-2 sm:left-12 z-50 p-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col gap-1 w-44 animate-fadeIn"
        >
          {/* Photo */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-200 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg">
              <BsImage className="w-4 h-4" />
            </div>
            <span>Photo / Media</span>
          </button>

          {/* WhatsApp Poll */}
          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(false);
              setIsPollModalOpen(true);
            }}
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-200 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <div className="p-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg">
              <FaPoll className="w-4 h-4" />
            </div>
            <span>Create Poll</span>
          </button>

          {/* Location */}
          <button
            type="button"
            onClick={handleShareLocation}
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-200 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <MdLocationOn className="w-4 h-4" />
            </div>
            <span>Send Location</span>
          </button>
        </div>
      )}

      {/* Image Attachment Preview */}
      {imagePreview && (
        <div className="relative inline-block mb-2 p-1.5 bg-slate-850/90 rounded-2xl border border-slate-700/80 shadow-lg">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl"
          />
          <button
            type="button"
            onClick={removeSelectedImage}
            className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-500 text-white rounded-full shadow"
            title="Remove photo"
          >
            <MdClose className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Active Voice Recording Bar */}
      {isRecording ? (
        <div className="flex items-center justify-between p-2 sm:p-2.5 bg-slate-800 border border-red-500/40 rounded-2xl shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shrink-0" />
            <span className="text-red-400 text-xs font-bold tracking-wider uppercase shrink-0">
              Recording
            </span>
            <span className="text-white text-xs sm:text-sm font-mono font-semibold">
              {formatSecs(recordingDuration)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={cancelRecording}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 rounded-xl hover:bg-slate-700/60 transition"
              title="Cancel recording"
            >
              <BsTrash className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {/* Send Voice Note Button */}
            <button
              type="button"
              onClick={stopAndSendRecording}
              className="p-2 sm:p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition"
              title="Send voice note"
            >
              <BsSend className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Standard Message Input Bar */
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-lg"
        >
          {/* Emoji Toggle */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-amber-400 transition rounded-xl shrink-0"
            title="Emojis"
          >
            <BsEmojiSmile className="w-5 h-5" />
          </button>

          {/* Attachment Menu Toggle */}
          <button
            type="button"
            onClick={() => setShowAttachMenu((prev) => !prev)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-400 transition rounded-xl shrink-0"
            title="Attach media or poll"
          >
            <BsPlusCircle className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            className="flex-1 min-w-0 bg-transparent px-2 py-1.5 sm:py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
            placeholder={
              selectedImage
                ? "Add a caption (optional)..."
                : "Type a message..."
            }
            value={message}
            onChange={handleTyping}
          />

          {/* Mic or Send Button */}
          {message.trim() || selectedImage ? (
            <button
              type="submit"
              disabled={loading}
              className="p-2 sm:p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition disabled:opacity-50 shrink-0"
            >
              {loading ? (
                <div className="loading loading-spinner loading-xs"></div>
              ) : (
                <BsSend className="w-4 h-4" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="p-2 sm:p-2.5 text-gray-400 hover:text-red-400 hover:bg-slate-700/50 rounded-xl transition shrink-0"
              title="Record voice note"
            >
              <BsMic className="w-5 h-5" />
            </button>
          )}
        </form>
      )}

      {/* WhatsApp Poll Modal */}
      <PollModal
        isOpen={isPollModalOpen}
        onClose={() => setIsPollModalOpen(false)}
        onCreatePoll={handleCreatePoll}
      />
    </div>
  );
};

export default MessageInput;
