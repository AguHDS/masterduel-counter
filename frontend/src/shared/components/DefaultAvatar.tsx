import React from "react";

interface AvatarProps {
  username: string;
  profilePictureUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_PX: Record<string, number> = {
  sm: 64,
  md: 80,
  lg: 128,
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

  if (profilePictureUrl) {
    const optimizedUrl = getOptimizedCloudinaryUrl(
      profilePictureUrl,
      SIZE_PX[size] ?? 80
    );
    return (
      <img
        src={optimizedUrl}
        alt={username}
        className={`rounded-sm border-2 border-[#c2901c]/30 object-cover ${sizeClasses[size]} ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`rounded-sm border-2 border-[#c2901c]/30 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold ${sizeClasses[size]} ${className}`}
    >
      {getInitial(username)}
    </div>
  );
};