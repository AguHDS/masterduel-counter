import { Mail, MessageCircle, AlertCircle } from "lucide-react";

export const ContactContent = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4">
          <Mail className="w-8 h-8 text-white" aria-hidden="true" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-2">Get In Touch</h3>
        <p className="text-gray-400">
          We'd love to hear from you! Whether you have questions, feedback, or
          suggestions.
        </p>
      </div>

      {/* Contenedor centrado */}
      <div className="flex justify-center">
        <div className="bg-gradient-to-br from-purple-950/50 to-blue-950/50 rounded-lg border border-purple-600/30 p-5 hover:border-purple-500/50 max-w-md w-full">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <MessageCircle
                className="w-5 h-5 text-purple-400"
                aria-hidden="true"
              />
            </div>
            <h4 className="text-lg font-semibold text-white">
              Discord Community
            </h4>
          </div>
          <p className="text-gray-300 text-sm mb-3">
            Join our{" "}
            <a
              href="https://discord.gg/wzkGb4Zgnw"
              className="text-blue-400 hover:text-blue-300"
              target="_blank"
              aria-label="Discord server"
            >
              Discord
            </a>{" "}
            server to chat with the community and give feedback
          </p>
          <p className="text-gray-400 text-sm">
            Ask questions and share feedback!
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-950/30 to-emerald-950/30 rounded-lg border border-green-600/30 p-5">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-green-400" aria-hidden="true" />
          What can you contact us about?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">Bug Reports</p>
              <p className="text-gray-400 text-sm">Found a bug? Let us know!</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">Feature Requests</p>
              <p className="text-gray-400 text-sm">Suggest new features</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">Content Issues</p>
              <p className="text-gray-400 text-sm">
                Report inappropriate content
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">General Questions</p>
              <p className="text-gray-400 text-sm">Ask anything!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-950/20 border border-yellow-600/30 rounded-lg p-4">
        <p className="text-yellow-200 text-sm flex items-start gap-2">
          <AlertCircle
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span>
            <strong>Please Note:</strong> This project was made by one person.
            Be patient and talk about it in our discord .
          </span>
        </p>
      </div>
    </div>
  );
};
