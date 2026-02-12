import {
  Code,
  Server,
  Star,
  ExternalLink,
  Shield,
  Sparkles,
} from "lucide-react";

export const SupportContent = () => {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-pink-900/40 p-6 border border-blue-500/30">
        <div className="absolute top-0 right-0 opacity-10"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h3 className="text-2xl font-bold text-white">
              Support Masterduel Counter
            </h3>
          </div>

          <p className="text-lg text-blue-200 leading-relaxed">
            Hi! I'm the dev behind Masterduel Counter. Every donation helps keep
            this project alive and growing.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-5 border border-blue-500/30 hover:border-blue-400 transition-all">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-900/50 rounded-lg">
              <Code className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">
                One developer at the moment
              </h4>
              <p className="text-sm text-gray-400">
                This project was made by one person, and support will keep me
                motivated to continue improving it. If you think this app is
                useful and you want to support it, feel free to donate to my
                paypal!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-5 border border-purple-500/30 hover:border-purple-400 transition-all">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-900/50 rounded-lg">
              <Server className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">
                Infrastructure Costs
              </h4>
              <p className="text-sm text-gray-400">
                100% of donations go directly to:
              </p>
              <ul className="text-sm text-gray-400 mt-2 list-disc list-inside">
                <li>Server hosting & bandwidth</li>
                <li>Database optimization</li>
                <li>API costs & maintenance</li>
                <li>Domain renewal</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Impact message */}
      <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 rounded-xl p-5 border border-amber-500/30">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-900/50 rounded-lg">
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">
              Get VIP role in our Discord
            </h4>
            <p className="text-sm text-gray-300">
              You'll recive VIP role as compensation for you support. This will
              grant you access to new features that I plan to implement, such as
              achievement system, better profile with favorite decks, etc...
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-green-400" /> Secure Payment
        </span>
        <span className="text-gray-600">•</span>
        <span className="flex items-center gap-1">One-time Donation</span>
        <span className="text-gray-600">•</span>
        <span>No account required</span>
      </div>

      <div className="flex flex-col items-center gap-4 pt-4">
        <a
          href="https://paypal.me/ponyrosa?locale.x=es_XC&country.x=AR"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#0070ba] to-[#1546a0] hover:from-[#1546a0] hover:to-[#0070ba] text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 border border-white/20"
        >
          <span>Donate with PayPal</span>
          <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
        </a>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Suggested:</span>
          <span className="px-2 py-1 bg-slate-800 rounded-md">$3</span>
          <span className="px-2 py-1 bg-slate-800 rounded-md">$5</span>
          <span className="px-2 py-1 bg-slate-800 rounded-md">$10</span>
          <span className="px-2 py-1 bg-slate-800 rounded-md">$25</span>
        </div>
      </div>
    </div>
  );
};
