import { BookCheck, User, Star, Heart, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CreateGuideInvite = () => {
  const navigate = useNavigate();

  const features = [
    { icon: BookCheck, text: "Create your own guides", color: "text-blue-400" },
    { icon: User, text: "Customizable profile", color: "text-purple-400" },
    { icon: Star, text: "Save guides as favorites", color: "text-yellow-400" },
    { icon: Layers, text: "Save your personal decks", color: "text-green-400" },
    { icon: Heart, text: "And much more!", color: "text-pink-400" },
  ];

  return (
    <div className="relative flex flex-col h-full">
      <div
        className="absolute inset-0 rounded-[26px] opacity-15"
        style={{
          background:
            "linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(236, 72, 153, 0.4) 50%, rgba(251, 146, 60, 0.4) 100%)",
        }}
      />

      <div className="relative z-10 p-6 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg">
              <BookCheck className="w-6 h-6 text-purple-300" />
            </div>
            <h3 className="text-2xl font-bold text-white">Create Your Own Guide</h3>
          </div>

          <p className="text-blue-200 mb-6 leading-relaxed">
            The content is created by the community. Sign up and create your own guides, either for personal use or sharing.
          </p>

          <div className="space-y-3 mb-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-[10px] rounded-lg bg-black/30 border border-purple-500/20"
                >
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                  <span className="text-white font-medium">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#ffa94d] via-[#ff7e29] to-[#ffce6d] opacity-80 blur-sm" />
          <button
            onClick={() => navigate("/signup")}
            className="relative w-full py-4 rounded-lg font-bold text-lg text-white bg-gradient-to-r from-[#1a1030] via-[#2d1b4e] to-[#1a1030] border-2 border-[#ffa94d] hover:border-[#ffce6d] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,169,77,0.3)] hover:shadow-[0_0_30px_rgba(255,206,109,0.5)] uppercase tracking-wide"
            style={{
              textShadow: '0 0 10px rgba(255, 206, 109, 0.5), 0 0 20px rgba(255, 169, 77, 0.3)',
            }}
          >
            <span className="bg-gradient-to-r from-[#ffa94d] via-[#ffce6d] to-[#ffa94d] bg-clip-text text-transparent font-extrabold">
              Get Started Now
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
