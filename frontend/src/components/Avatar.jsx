import { useState, useEffect } from "react";
import { getInitials, getAvatarGradient } from "../utils/avatar";

const Avatar = ({
  name = "",
  src = "",
  isOnline = false,
  size = "w-12 h-12 text-base",
  className = "",
  preferInitials = false,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const isBrokenSrc = !src || src.includes("iran.liara.run");
  const showImage = !preferInitials && Boolean(src) && !isBrokenSrc && !imgError;
  const initials = getInitials(name);
  const gradient = getAvatarGradient(name || "default");

  return (
    <div
      className={`avatar ${!showImage ? "placeholder" : ""} ${
        isOnline ? "online" : ""
      } ${className}`}
    >
      <div
        className={`rounded-full overflow-hidden ${size} ${
          !showImage
            ? `${gradient} text-white font-bold select-none shadow-sm flex items-center justify-center`
            : "flex items-center justify-center"
        }`}
      >
        {showImage ? (
          <img
            src={src}
            alt={name || "user avatar"}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="tracking-wide uppercase leading-none">{initials}</span>
        )}
      </div>
    </div>
  );
};

export default Avatar;
