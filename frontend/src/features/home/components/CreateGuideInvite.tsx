import { BookPlus, User, Heart, MessageSquare, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CreateGuideInvite = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookPlus,
      title: "Counter guides",
      description: "Create detailed counter guides for any archetype",
    },
    {
      icon: User,
      title: "Customizable user profile",
      description: "Personalize your profile and showcase your guides",
    },
    {
      icon: Heart,
      title: "Get Supporter role to gain benefits",
      description: "Support the platform and unlock exclusive features",
    },
    {
      icon: Award,
      title: "Ranking system",
      description: "Climb the ranks and become a top contributor",
    },
    {
      icon: MessageSquare,
      title: "Feedback",
      description: "Share your thoughts and help us improve",
    },
  ];

  return (
    <div className="relative flex flex-col rounded-2xl overflow-hidden border border-purple-500/30 bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-blue-900/20 p-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Main Features</h2>
        <p className="text-gray-300 text-lg">
          Create counter guides, save your personal decks and favorite guides in
          your profile, and give feedback to help masterduelcounter improve!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-black/30 border border-purple-500/20 hover:border-purple-400/40 hover:bg-black/50 transition-all"
            >
              <div className="p-3 rounded-full bg-purple-500/20 mb-4">
                <Icon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => navigate("/create-guide")}
          className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
        >
          Start Creating Guides
        </button>
      </div>
    </div>
  );
};
