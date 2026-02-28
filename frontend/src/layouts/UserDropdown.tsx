import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/features/auth";
import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/features/profile/api/profileApi";

const getDefaultAvatar = (userName: string) => {
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="w-7 h-7 rounded-md flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-[#c2901c]/40 group-hover:border-[#c2901c]/60 transition-colors">
      {initial}
    </div>
  );
};

export const UserDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user profile to get profile picture
  const { data: profileData } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => profileApi.getProfile(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const profilePictureUrl = profileData?.profile?.profilePictureUrl;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-[#c2901c]/10 rounded-lg transition-all group"
        aria-label="User menu"
      >
        {profilePictureUrl ? (
          <img
            src={profilePictureUrl}
            alt={user.name}
            className="w-7 h-7 rounded-md border-2 border-[#c2901c]/40 group-hover:border-[#c2901c]/60 transition-colors object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = document.createElement("div");
                fallback.innerHTML = getDefaultAvatar(user.name).props.children;
                fallback.className =
                  "w-7 h-7 rounded-md flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-[#c2901c]/40 group-hover:border-[#c2901c]/60 transition-colors";
                fallback.textContent = user.name.charAt(0).toUpperCase();
                parent.insertBefore(fallback, e.currentTarget);
              }
            }}
          />
        ) : (
          getDefaultAvatar(user.name)
        )}
        <span className="hidden xl:inline text-sm font-medium text-white group-hover:text-[#c2901c] transition-colors max-w-[120px] truncate">
          {user.name}
        </span>
        <ChevronDown
          className={`hidden xl:block w-4 h-4 text-[#c2901c] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#1f1a24] border-2 border-[#c2901c]/40 rounded-lg shadow-2xl overflow-hidden z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-[#c2901c]/20 bg-gradient-to-r from-[#1f1a24] to-[#2a2430]">
            <p className="text-sm font-medium text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to={`/profile/${user.id}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-[#c2901c]/10 hover:text-white transition-colors"
            >
              <User className="w-4 h-4 text-blue-400" />
              <span>Profile</span>
            </Link>

            <Link
              to="/configuration"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-[#c2901c]/10 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4 text-purple-400" />
              <span>Configuration</span>
            </Link>

            <div className="my-1 border-t border-[#c2901c]/20" />

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
