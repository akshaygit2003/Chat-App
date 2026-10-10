import { useState } from "react";
import { BiLogOut } from "react-icons/bi";
import { FiEdit3 } from "react-icons/fi";
import useLogout from "../../hooks/useLogout";
import { useAuthContext } from "../../context/AuthContext";
import Avatar from "../Avatar";
import ProfileModal from "../profile/ProfileModal";

const LogoutButton = () => {
  const { loading, logout } = useLogout();
  const { authUser } = useAuthContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-600/40">
        {authUser && (
          <div
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 overflow-hidden mr-2 p-1.5 -ml-1 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors group flex-1"
            title="Click to edit profile"
          >
            <div className="relative">
              <Avatar
                name={authUser.fullName || authUser.username}
                src={authUser.profilePic}
                size="w-9 h-9 text-xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 bg-blue-600 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <FiEdit3 className="w-2.5 h-2.5" />
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-gray-200 text-sm font-semibold truncate max-w-[120px] group-hover:text-blue-400 transition-colors">
                {authUser.fullName}
              </span>
              <span className="text-gray-400 text-xs truncate max-w-[120px]">
                @{authUser.username}
              </span>
            </div>
          </div>
        )}
        <div className="relative group shrink-0 ml-1">
          {!loading ? (
            <div>
              <BiLogOut
                className="w-6 h-6 text-white cursor-pointer hover:text-red-400 transition-colors"
                onClick={logout}
              />
              {/* Tooltip */}
              <span className="absolute bottom-[110%] right-0 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Logout
              </span>
            </div>
          ) : (
            <span className="loading loading-spinner"></span>
          )}
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};

export default LogoutButton;
