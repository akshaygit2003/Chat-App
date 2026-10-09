import { BiLogOut } from "react-icons/bi";
import useLogout from "../../hooks/useLogout";
import { useAuthContext } from "../../context/AuthContext";
import Avatar from "../Avatar";

const LogoutButton = () => {
  const { loading, logout } = useLogout();
  const { authUser } = useAuthContext();

  return (
    <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-600/40">
      {authUser && (
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          <Avatar
            name={authUser.fullName || authUser.username}
            src={authUser.profilePic}
            size="w-9 h-9 text-xs"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-gray-200 text-sm font-semibold truncate max-w-[130px]">
              {authUser.fullName}
            </span>
            <span className="text-gray-400 text-xs truncate max-w-[130px]">
              @{authUser.username}
            </span>
          </div>
        </div>
      )}
      <div className="relative group shrink-0">
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
  );
};

export default LogoutButton;
