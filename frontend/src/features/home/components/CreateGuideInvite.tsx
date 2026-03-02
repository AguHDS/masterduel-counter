import {
  BookCheck,
  ThumbsUp,
  User,
  Star,
  Heart,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const CreateGuideInvite = () => {
  const navigate = useNavigate();
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const features = [
    { icon: User, text: "Customizable user profile", color: "text-purple-400" },
    {
      icon: ThumbsUp,
      text: "Rate guides created by users",
      color: "text-green-500",
    },
    { icon: Layers, text: "Save your personal decks", color: "text-cyan-400" },
    { icon: Star, text: "Save guides as favorites", color: "text-yellow-400" },
    {
      icon: Heart,
      text: "Get Supporter role to gain benefits",
      color: "text-pink-400",
      details: [
        "+15 personal deck space (Max. 30)",
        "Unlimited favorite guides",
        "More benefits will be added for Supporters",
      ],
    },
  ];

  const toggleExpand = (index: number) => {
    setExpandedFeature(expandedFeature === index ? null : index);
  };

  return (
    <div className="relative flex flex-col h-full">
      <div
        className="absolute inset-0 rounded-[26px] opacity-15"
        style={{
          background:
            "linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(236, 72, 153, 0.4) 50%, rgba(251, 146, 60, 0.4) 100%)",
        }}
      />

      <div className="relative z-10 p-6 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-comments pr-1">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg">
                <BookCheck className="w-6 h-6 text-purple-300" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Create Counter Guides
              </h3>
            </div>

            <p className="text-blue-200 mb-6 leading-relaxed">
              The content is added by the community.{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-500 hover:text-blue-100 transition-colors inline"
              >
                Sign up
              </button>{" "}
              and create your own counter guides, either for personal use or
              sharing.
            </p>

            <div className="space-y-2 mb-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const hasDetails =
                  feature.details && feature.details.length > 0;
                const isExpanded = expandedFeature === index;

                return (
                  <div key={index} className="flex flex-col">
                    <div
                      onClick={() => hasDetails && toggleExpand(index)}
                      className={`
                        flex items-center gap-3 p-[10px] rounded-lg 
                        bg-black/30 border border-purple-500/20
                        ${hasDetails ? "cursor-pointer hover:bg-black/40 transition-all duration-200" : ""}
                      `}
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
                            <ChevronUp className="w-4 h-4 transition-transform duration-200" />
                          ) : (
                            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                          )}
                        </button>
                      )}
                    </div>

                    <div
                      className={`
                        grid transition-all duration-300 ease-in-out
                        ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"}
                      `}
                      style={{ width: "100%" }}
                    >
                      <div className="overflow-hidden">
                        <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-500/30 w-full">
                          <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-comments pr-2">
                            {feature.details?.map((detail, detailIndex) => (
                              <div
                                key={detailIndex}
                                className="flex items-start gap-2 text-sm"
                              >
                                <span className="text-pink-400 mt-1 relative bottom-1">
                                  •
                                </span>
                                <span className="text-purple-200 font-semibold">
                                  {detail}
                                </span>
                              </div>
                            ))}

                            {/* PayPal support link */}
                            <div className="flex justify-center pt-3 mt-2 border-t border-purple-500/30">
                              <p className="text-sm text-purple-200">
                                Click{" "}
                                <a
                                  href="https://paypal.me/ponyrosa?locale.x=es_XC&country.x=AR"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-pink-400 hover:text-pink-300 font-bold transition-colors underline decoration-pink-400/30 hover:decoration-pink-300"
                                >
                                  here
                                </a>{" "}
                                to support Masterduel Counter!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative mt-4 pt-1">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#ffa94d] via-[#ff7e29] to-[#ffce6d] opacity-80 blur-md" />
          <button
            onClick={() => navigate("/signup")}
            className="relative w-full py-4 rounded-lg font-bold text-lg text-white bg-gradient-to-r from-[#1a1030] via-[#2d1b4e] to-[#1a1030] border-2 border-[#ffa94d] hover:border-[#ffce6d] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,169,77,0.3)] hover:shadow-[0_0_30px_rgba(255,206,109,0.5)] uppercase tracking-wide"
            style={{
              textShadow:
                "0 0 10px rgba(255, 206, 109, 0.5), 0 0 20px rgba(255, 169, 77, 0.3)",
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
