import { useState, useRef } from "react";
import { BsSend, BsImage } from "react-icons/bs";
import { MdClose } from "react-icons/md";
import useSendMessage from "../../hooks/useSendMessage";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { loading, sendMessage } = useSendMessage();
  const { socket } = useSocketContext();
  const { selectedConversation } = useConversation();

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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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

    await sendMessage(msgToSend, imgToSend);
  };

  return (
    <form className="px-4 my-3" onSubmit={handleSubmit}>
      {/* Image Attachment Preview */}
      {imagePreview && (
        <div className="relative inline-block mb-2 p-1.5 bg-slate-800 rounded-xl border border-slate-700 shadow-md">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={removeSelectedImage}
            className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-500 text-white rounded-full shadow"
            title="Remove image"
          >
            <MdClose className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="w-full relative flex items-center">
        {/* Attachment Picker */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-blue-400 transition"
          title="Attach photo"
        >
          <BsImage className="w-5 h-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />

        <input
          type="text"
          className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          placeholder={selectedImage ? "Add a caption (optional)..." : "Send a message..."}
          value={message}
          onChange={handleTyping}
        />

        <button
          type="submit"
          disabled={loading || (!message.trim() && !selectedImage)}
          className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-300 hover:text-white disabled:opacity-40"
        >
          {loading ? (
            <div className="loading loading-spinner loading-sm"></div>
          ) : (
            <BsSend className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
