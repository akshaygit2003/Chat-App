import { useState, useRef } from "react";
import { MdCameraAlt, MdClose } from "react-icons/md";
import { useAuthContext } from "../../context/AuthContext";
import useUpdateProfile from "../../hooks/useUpdateProfile";
import Avatar from "../Avatar";

const ProfileModal = ({ isOpen, onClose }) => {
  const { authUser } = useAuthContext();
  const { loading, updateProfileDetails, updateAvatar } = useUpdateProfile();

  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [gender, setGender] = useState(authUser?.gender || "other");
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // If an image was selected, upload it first
    if (selectedFile) {
      const avatarSuccess = await updateAvatar(selectedFile);
      if (!avatarSuccess) return;
    }

    // Update textual details
    const detailsSuccess = await updateProfileDetails({
      fullName,
      bio,
      gender,
    });

    if (detailsSuccess) {
      setSelectedFile(null);
      setPreviewImage(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white tracking-wide">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Avatar Upload Preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group cursor-pointer">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 shadow-md"
                />
              ) : (
                <Avatar
                  name={authUser?.fullName || authUser?.username}
                  src={authUser?.profilePic}
                  size="w-24 h-24 text-2xl"
                />
              )}

              {/* Camera Icon Overlay */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <MdCameraAlt className="w-7 h-7 text-white" />
                <span className="text-[10px] text-gray-200 font-medium mt-0.5">
                  Change
                </span>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-xs text-gray-400 mt-2">
              Click photo to change avatar (Max 5MB)
            </p>
          </div>

          {/* User Handle & Email Information */}
          <div className="flex justify-between items-center px-3 py-2 bg-slate-800/60 rounded-lg text-xs text-gray-400">
            <span>
              Username: <strong className="text-gray-200">@{authUser?.username}</strong>
            </span>
            {authUser?.email && (
              <span className="truncate max-w-[180px]">
                {authUser?.email}
              </span>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition"
              placeholder="Your full name"
            />
          </div>

          {/* Bio / Status */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Bio / Status
              </label>
              <span className="text-[11px] text-gray-400">
                {bio.length}/150
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 150))}
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition resize-none"
              placeholder="Tell others what you're up to..."
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other / Prefer not to say</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-md shadow-blue-600/30 flex items-center justify-center min-w-[100px]"
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
