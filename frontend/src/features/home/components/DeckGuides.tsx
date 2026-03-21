import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockDeckGuides = [
  {
    id: 1,
    title: "Branded Guide",
    author: "Jared Wong",
    archetype: "Branded",
    date: "April 24, 2024",
  },
  {
    id: 2,
    title: "Rescue-Ace Deck Guide",
    author: "Jared Wong",
    archetype: "Rescue-Ace",
    date: "April 24, 2024",
  },
  {
    id: 3,
    title: "Labrynth Deck Guide",
    author: "Jared Wong",
    archetype: "Labrynth",
    date: "April 24, 2024",
  },
];

export const DeckGuides = () => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/deck-guides");
  };

  return (
    <div className="relative mt-2 w-full flex flex-col h-full overflow-hidden">
      <div className="relative z-10 flex flex-col h-full p-6 overflow-hidden">
        <div>
          <div className="flex items-center gap-4">
            <BookOpen className="w-7 h-7 text-blue-400" />
            <h2 className="text-3xl relative bottom-[2px] font-bold text-yellow-100">
              Deck Guides
            </h2>
          </div>

          <p className="text-gray-300 text-xl mb-1 relative top-1 left-11">
            Combo lines and deck builds
          </p>
        </div>

        <div className="mb-12 relative top-5">
          <h3 className="text-blue-300 text-2xl">Latest Deck Guides</h3>
        </div>

        <div className="flex-1 relative bottom-6 min-h-0 overflow-y-auto scrollbar-deckguides">
          {mockDeckGuides.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-blue-300">
              <p className="text-center text-sm">No guides created yet</p>
              <p className="text-xs text-gray-400 mt-2">
                Be the first to create one!
              </p>
            </div>
          ) : (
            mockDeckGuides.map((guide) => (
              <div
                key={guide.id}
                className="flex items-start relative top-3 gap-3 p-1 bg-black/40 border border-blue-500/30 hover:border-blue-400/60 hover:bg-black/60 transition-all cursor-pointer min-w-0"
              >
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 border-2 border-blue-400/50 bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl">
                    {guide.archetype.charAt(0)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-semibold text-md truncate">
                      {guide.author}
                    </p>
                    <span className="text-xs text-gray-500">•</span>
                    <p className="text-blue-400 text-sm truncate">
                      {guide.archetype}
                    </p>
                  </div>

                  <h4 className="text-yellow-200 font-semibold text-md mb-1 line-clamp-2">
                    {guide.title}
                  </h4>

                  <div className="flex items-center justify-end mt-5">
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {guide.date}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div
          onClick={handleViewAll}
          className="relative top-3 m-auto flex items-center justify-center px-3 py-1.5 text-blue-400/90 hover:text-blue-300 active:text-blue-600/90 text-[20px] cursor-pointer transition-all duration-150 border border-blue-500/30 hover:border-blue-400/60 active:border-blue-700/50 rounded-lg bg-transparent hover:bg-blue-500/5 active:bg-blue-700/20 backdrop-blur-sm"
        >
          <span>View All Deck Guides</span>
        </div>
      </div>
    </div>
  );
};
