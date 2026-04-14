import React from "react";

interface AvatarProps {
  username: string;
  profilePictureUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_PX: Record<string, number> = {
  sm: 32,
  md: 48,
  lg: 64,
};

function getOptimizedCloudinaryUrl(url: string, sizePx: number): string {
  if (!url.includes("res.cloudinary.com")) return url;
  const transform = `w_${sizePx},h_${sizePx},c_fill,q_auto,f_auto`;
  return url.replace("/upload/", `/upload/${transform}/`);
}

/** Default profile picture when user has not set one */
export const Avatar: React.FC<AvatarProps> = ({
  username,
  profilePictureUrl,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const baseClasses =
    "rounded-sm border-2 border-[#c2901c]/30 object-cover flex-shrink-0";
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  if (profilePictureUrl) {
    const optimizedUrl = getOptimizedCloudinaryUrl(
      profilePictureUrl,
      SIZE_PX[size] ?? 80,
    );
    return (
      <img
        src={optimizedUrl}
        alt={username}
        className={`${baseClasses} ${sizeClass} ${className}`}
        loading="lazy"
        style={{ width: `${SIZE_PX[size]}px`, height: `${SIZE_PX[size]}px` }}
      />
    );
  }

  return (
    <div
      className={`${baseClasses} flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold ${sizeClass} ${className}`}
      style={{ width: `${SIZE_PX[size]}px`, height: `${SIZE_PX[size]}px` }}
    >
      {getInitial(username)}
    </div>
  );
};
