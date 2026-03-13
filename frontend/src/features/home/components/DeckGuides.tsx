import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "@/assets/home-rework/background_container_blue.webp";

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
    <div className="relative w-full flex flex-col h-full overflow-hidden border border-blue-500/30">
      <div
        className="absolute inset-0 opacity-70"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 flex flex-col h-full p-6 overflow-hidden">
        <div className="mb-2">
          <div className="flex items-center gap-4">
            <BookOpen className="w-7 h-7 text-blue-400" />
            <h2 className="text-3xl relative bottom-[2px] font-bold text-yellow-100">
              Deck Guides
            </h2>
          </div>

          <p className="text-gray-300 text-xl mb-1 relative top-1 left-11">
            Learn combo lines and deck builds
          </p>
        </div>

        <div className="mb-20 relative top-14">
          <h3 className="text-blue-300 text-2xl">Lastest Deck Guides</h3>
        </div>

        <div className="flex-1 min-h-0 mb-2 space-y-1">
          {mockDeckGuides.map((guide) => (
            <div
              key={guide.id}
              className="flex items-start gap-3 p-2 rounded-lg bg-black/40 border border-blue-500/20 hover:border-blue-400/50 hover:bg-black/60 transition-all cursor-pointer min-w-0"
            >
              <div className="flex-shrink-0">
                <div className="w-24 h-16 rounded-lg border-2 border-blue-400/50 bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl">
                  {guide.archetype.charAt(0)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-yellow-200 font-semibold text-md mb-1 line-clamp-1">
                  {guide.title}
                </h4>

                <p className="text-sm text-gray-400">by {guide.author}</p>

                <div className="flex justify-end mt-2">
                  <span className="text-xs text-gray-500">{guide.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          onClick={handleViewAll}
          className="relative top-3 m-auto flex items-center justify-center gap-2 px-3 py-1.5 text-blue-400/90 hover:text-blue-300 active:text-blue-600/90 text-[20px] cursor-pointer transition-all duration-150 border border-blue-500/30 hover:border-blue-400/60 active:border-blue-700/50 rounded-lg bg-transparent hover:bg-blue-500/5 active:bg-blue-700/20 backdrop-blur-sm"
        >
          <span>View All Deck Guides</span>
        </div>
      </div>
    </div>
  );
};
