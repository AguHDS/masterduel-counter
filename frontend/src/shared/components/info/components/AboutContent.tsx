import { Target, Users, BookOpen, Sparkles } from "lucide-react";

export const AboutContent = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 bg-blue-950/30 rounded-lg border border-blue-600/30">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <Target className="w-6 h-6 text-blue-400" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            What is Masterduel Counter?
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Masterduel Counter is a community-driven platform designed to help
            you find effective counter strategies against archetypes. Whether
            you're facing an archetype, our platform provides detailed guides
            created by players.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 bg-purple-950/30 rounded-lg border border-purple-600/30">
        <div className="p-2 bg-purple-600/20 rounded-lg">
          <Users className="w-6 h-6 text-purple-400" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Community-Powered
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Every counter guide on this platform is created by players like you.
            Share your knowledge, learn from others, and help the community
            improve their gameplay. Vote for the most effective strategies and
            discover new ways to approach challenging matchups.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 bg-cyan-950/30 rounded-lg border border-cyan-600/30">
        <div className="p-2 bg-cyan-600/20 rounded-lg">
          <BookOpen className="w-6 h-6 text-cyan-400" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            How It Works
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold mt-1">1.</span>
              <span>Search for the archetype you're struggling against</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold mt-1">2.</span>
              <span>Learn how to use your handtraps proplery use against them, and better strategies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold mt-1">3.</span>
              <span>Check which deck is the creator of the guide playing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold mt-1">4.</span>
              <span>Create your own guides to help other players</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 bg-green-950/30 rounded-lg border border-green-600/30">
        <div className="p-2 bg-green-600/20 rounded-lg">
          <Sparkles className="w-6 h-6 text-green-400" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Key Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-gray-300">Card-specific counters</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-gray-300">
                Strategy effectiveness ratings
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-gray-300">Community voting system</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-gray-300">Detailed comments & tips</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
