import React from "react";

interface AvatarProps {
  username: string;
  profilePictureUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
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
    return (
      <img
        src={profilePictureUrl}
        alt={username}
        className={`rounded-full border-2 border-[#c2901c]/30 object-cover ${sizeClasses[size]} ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`rounded-full border-2 border-[#c2901c]/30 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold ${sizeClasses[size]} ${className}`}
    >
      {getInitial(username)}
    </div>
  );
};