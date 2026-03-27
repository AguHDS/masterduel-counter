import {
  GamepadDirectional,
  User,
  Heart,
  ChevronDown,
  ChevronUp,
  Crown,
  RectangleEllipsis,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const MainFeatures = () => {
  const navigate = useNavigate();
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const features = [
    {
      icon: GamepadDirectional,
      text: "Create Guides",
      color: "text-green-400",
      details: [
        "Create or search counter guides",
        "Rate and comment on guides",
        "Save guides as favorites",
        "Can't find a guide? Be the first to create one",
      ],
    },
    {
      icon: User,
      text: "Customize Your Profile",
      color: "text-purple-400",
      details: [
        "Show your favorite card and decks",
        "Save your personal decks",
        "Check your favorite guides",
      ],
    },
    {
      icon: Heart,
      text: "Get Supporter Role to Gain Benefits",
      color: "text-pink-400",
      details: [
        "+15 personal deck space (Max. 30)",
        "Unlimited favorite guides",
        "More benefits will be added for Supporters",
      ],
    },
    {
      icon: Crown,
      text: "Ranking System",
      color: "text-yellow-400",
      details: ["Rank up by getting likes on your guides"],
    },
    {
      icon: RectangleEllipsis,
      text: "Join Discord",
      color: "text-blue-400",
      details: [
        "Join Discord server",
        "Report errors, bugs,",
        "Give feedback",
        "Suggest new features",
      ],
    },
  ];

  const toggleExpand = (index: number) => {
    setExpandedFeature(expandedFeature === index ? null : index);
  };

  const handleSupportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/support");
  };

  const handleDiscordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open("https://discord.gg/wzkGb4Zgnw", "_blank");
  };

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-slate-900/90">
      <div className="absolute inset-[2px] rounded-[24px]" />

      <div className="relative z-10 p-6 flex flex-col h-full min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-homeAllPages pr-1 min-h-0">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-2xl font-bold text-white">
              General Features
            </h3>
          </div>

          <p className="text-blue-200 mb-6 leading-relaxed">
            Create counter guides, save your personal decks and favorite guides
            in your profile, and give feedback to help masterduelcounter
            improve!
          </p>

          <div className="space-y-2 mb-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const hasDetails = feature.details && feature.details.length > 0;
              const isExpanded = expandedFeature === index;

              return (
                <div key={index} className="flex flex-col">
                  <div
                    onClick={() => hasDetails && toggleExpand(index)}
                    className={`flex items-center gap-3 p-[10px] rounded-lg 
                    bg-black/40 border border-purple-500/30
                    ${
                      hasDetails
                        ? "cursor-pointer hover:bg-black/50 transition-all duration-200"
                        : ""
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${feature.color} flex-shrink-0`}
                    />
                    <span className="text-white font-medium flex-1">
                      {feature.text}
                    </span>

                    {hasDetails && (
                      <button className="text-purple-400 hover:text-purple-300 transition-colors">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  <div
                    className={`grid transition-all duration-300 ease-in-out
                      ${
                        isExpanded
                          ? "grid-rows-[1fr] opacity-100 mt-1"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-3 rounded-lg bg-purple-900/40 border border-purple-500/40">
                        <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-comments pr-2">
                          {feature.details?.map((detail, detailIndex) => {
                            if (detail.includes("Join Discord")) {
                              return (
                                <div
                                  key={detailIndex}
                                  onClick={handleDiscordClick}
                                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-purple-800/40 rounded-lg p-1 -m-1 transition-colors"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                                  <span className="text-purple-200 font-semibold">
                                    {detail}
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={detailIndex}
                                className="flex items-center gap-2 text-sm"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                                <span className="text-purple-200 font-semibold">
                                  {detail}
                                </span>
                              </div>
                            );
                          })}

                          {index === 2 && (
                            <div className="flex justify-center pt-3 mt-2 border-t border-purple-500/30">
                              <p className="text-sm text-purple-200">
                                Click{" "}
                                <button
                                  onClick={handleSupportClick}
                                  className="text-pink-400 hover:text-pink-300 font-bold underline decoration-pink-400/30 hover:decoration-pink-300"
                                >
                                  here
                                </button>{" "}
                                to support Masterduel Counter!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative mt-5 pt-1 flex justify-center">
          <div className="absolute w-[50%] inset-y-0 rounded-lg bg-gradient-to-r from-[#ffa94d] via-[#ff7e29] to-[#ffce6d] opacity-40 blur-md" />
          <button
            onClick={() => navigate("/signup")}
            className="relative w-[50%] py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-[#1a1030] via-[#2d1b4e] to-[#1a1030] border-2 border-[#ffa94d] hover:border-[#ffce6d] uppercase tracking-wide transition-all duration-200 hover:brightness-110 active:brightness-75"
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
