import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";
import useConversation from "../../zustand/useConversation";

const Home = () => {
  const { selectedConversation } = useConversation();

  return (
    <div className="flex w-full sm:max-w-6xl h-full sm:h-[90vh] rounded-none sm:rounded-3xl overflow-hidden border-0 sm:border border-gray-400/20 shadow-2xl bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0 transition-all">
      <Sidebar />
      <MessageContainer />
    </div>
  );
};

export default Home;
