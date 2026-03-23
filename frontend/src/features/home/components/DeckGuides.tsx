import { BookOpen, Eye, ThumbsUp, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockDeckGuides = [
  {
    id: 1,
    title: "Branded Guide - Complete Combo Guide and Deck Building Tips for the Branded Archetype",
    author: "Jared Wong",
    archetype: "Branded",
    date: "2024-04-24T10:00:00Z",
    views: 15420,
    likes: 1243,
    favorites: 876,
  },
  {
    id: 2,
    title: "Rescue-Ace Deck Guide",
    author: "Jared Wong",
    archetype: "Rescue-Ace",
    date: "2024-04-24T10:00:00Z",
    views: 8920,
    likes: 756,
    favorites: 543,
  },
  {
    id: 3,
    title: "Labrynth Deck Guide - Comprehensive Guide to Labrynth",
    author: "Jared Wong",
    archetype: "Labrynth",
    date: "2024-04-24T10:00:00Z",
    views: 12340,
    likes: 987,
    favorites: 654,
  },
    {
    id: 4,
    title: "Labrynth Deck Guide - Comprehensive Guide to Labrynth",
    author: "Jared Wong",
    archetype: "Labrynth",
    date: "2024-04-24T10:00:00Z",
    views: 4,
    likes: 987,
    favorites: 654,
  },
];

const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
};

export const DeckGuides = () => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/deck-guides");
  };

  return (
    <div className="relative mt-2 w-full flex flex-col h-full overflow-hidden">
      <div className="relative z-10 flex flex-col h-full p-4 overflow-hidden">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <BookOpen className="w-7 h-7 text-blue-400" />
            <h2 className="text-2xl relative bottom-[2px] font-bold text-yellow-100">
              Deck Guides
            </h2>
          </div>

          <p className="text-gray-300 text-xl mb-1 relative top-1 left-11">
            Combo lines and deck builds
          </p>
        </div>

        <div className="mb-4">
          <h3 className="text-blue-300 text-2xl">Latest Deck Guides</h3>
        </div>

        <div className="flex-1 min-h-[320px] border border-blue-500/30 overflow-y-auto scrollbar-deckguides">
          {mockDeckGuides.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-blue-300">
              <p className="text-center text-sm">No guides created yet</p>
              <p className="text-xs text-gray-400 mt-2">
                Be the first to create one!
              </p>
            </div>
          ) : (
            mockDeckGuides.map((guide) => {
              const timeAgo = getTimeAgo(guide.date);

              return (
                <div
                  key={guide.id}
                  className="flex items-start gap-3 p-2 bg-black border border-blue-500/30 hover:border-blue-400/60 hover:bg-black/60 transition-all cursor-pointer min-w-0 relative"
                >
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-md border-2 border-blue-400/50 bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl">
                      {guide.archetype.charAt(0)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pr-44">
                    <h4 className="text-yellow-200 font-bold text-lg line-clamp-2">
                      {guide.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-300 text-sm font-medium truncate">
                        By {guide.author}
                      </p>
                      <span className="text-xs text-gray-500">•</span>
                      <p className="text-blue-400 text-sm truncate">
                        {guide.archetype}
                      </p>
                    </div>
                  </div>

                  {/* Stats in top right corner */}
                  <div className="absolute top-2 right-2 flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 text-purple-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">
                        {guide.views.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">
                        {guide.favorites.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-green-500">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">
                        {guide.likes.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Time ago in bottom right corner */}
                  <div className="absolute bottom-2 right-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {timeAgo}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div
          onClick={handleViewAll}
          className="relative mt-4 m-auto flex items-center text-[21px] justify-center px-3 py-1.5 text-blue-400/90 hover:text-blue-300 active:text-blue-600/90 cursor-pointer transition-all duration-150 border border-blue-500/50 hover:border-blue-400/60 active:border-blue-700/50 rounded-lg bg-transparent hover:bg-blue-500/20 active:bg-blue-700/20 backdrop-blur-sm"
        >
          <span>View All Deck Guides</span>
        </div>
      </div>
    </div>
  );
};