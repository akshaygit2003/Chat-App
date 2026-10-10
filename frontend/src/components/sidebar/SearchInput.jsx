import { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import useConversation from "../../zustand/useConversation";
import useGetConversations from "../../hooks/useGetConversations";
import toast from "react-hot-toast";

const SearchInput = () => {
  const [search, setSearch] = useState("");
  const { setSelectedConversation } = useConversation();
  const { conversations } = useGetConversations();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    const term = search.trim().toLowerCase();
    const conversation = conversations.find(
      (c) =>
        c.fullName?.toLowerCase().includes(term) ||
        c.username?.toLowerCase().includes(term)
    );

    if (conversation) {
      setSelectedConversation(conversation);
      setSearch("");
    } else {
      toast.error("No user found matching search");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center w-full">
      <IoSearchSharp className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        placeholder="Search people..."
        className="w-full pl-9 pr-8 py-2 bg-slate-850/90 border border-slate-700/70 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition shadow-inner"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {search && (
        <button
          type="button"
          onClick={() => setSearch("")}
          className="absolute right-2.5 text-gray-400 hover:text-white text-xs p-0.5 rounded-full"
        >
          ✕
        </button>
      )}
    </form>
  );
};

export default SearchInput;
