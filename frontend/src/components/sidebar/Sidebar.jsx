import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";
import useConversation from "../../zustand/useConversation";

const Sidebar = () => {
  const { selectedConversation } = useConversation();

  return (
    <div
      className={`border-r border-slate-500/40 p-3 sm:p-4 flex-col w-full sm:w-80 md:w-96 shrink-0 bg-transparent h-full transition-all duration-200 ${
        selectedConversation ? "hidden sm:flex" : "flex"
      }`}
    >
      <SearchInput />
      <div className="divider my-1.5 sm:my-2 opacity-30"></div>
      <Conversations />
      <LogoutButton />
    </div>
  );
};

export default Sidebar;
