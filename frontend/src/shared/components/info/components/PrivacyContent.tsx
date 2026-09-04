import {
  Shield,
  Database,
  Cookie,
  Lock,
  ExternalLink,
  FileText,
} from "lucide-react";

export const PrivacyContent = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-950/30 rounded-lg border border-blue-600/30 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-6 h-6 text-blue-400" aria-hidden="true" />
          <h3 className="text-xl font-semibold text-white">Privacy Policy</h3>
        </div>
        <p className="text-gray-300 text-sm mb-4">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <section>
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" aria-hidden="true" />
          1. Overview
        </h4>
        <p className="text-gray-300 leading-relaxed">
          Masterduel Counter is a community platform where users can create,
          share, and discover archetype counter guides and deck guides for
          Yu-Gi-Oh! Master Duel. This Privacy Policy explains what information
          we collect, how we use it, and the choices you have regarding your
          data.
        </p>
        <p className="text-gray-300 leading-relaxed mt-2">
          By using Masterduel Counter, you agree to the collection and use of
          information in accordance with this policy.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" aria-hidden="true" />
          2. Information We Collect
        </h4>
        <div className="space-y-3 ml-4">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-700/30">
            <p className="text-sm font-semibold text-purple-300 mb-1">
              Account Information
            </p>
            <p className="text-sm text-gray-300">
              When you register, we collect your username, email address, and
              password (stored securely hashed). You may also optionally
              provide a profile picture.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-700/30">
            <p className="text-sm font-semibold text-purple-300 mb-1">
              Content You Create
            </p>
            <p className="text-sm text-gray-300">
              This includes your guides, comments, custom decks, tier list
              entries, and any other content you publish on the platform.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-700/30">
            <p className="text-sm font-semibold text-purple-300 mb-1">
              Usage Data
            </p>
            <p className="text-sm text-gray-300">
              We collect basic interaction data such as page views, likes,
              favorites, and guide view counts to power features like the
              ranking system and to improve the service.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Lock className="w-5 h-5 text-green-400" aria-hidden="true" />
          3. How We Use Your Information
        </h4>
        <ul className="space-y-2 text-gray-300 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>To provide, operate, and maintain the platform</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              To authenticate you and keep your account secure
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>To calculate rankings and display community stats</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              To improve the service and understand how it is used
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>To respond to reports and enforce our guidelines</span>
          </li>
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-cyan-400" aria-hidden="true" />
          4. Third-Party Services
        </h4>
        <p className="text-gray-300 leading-relaxed mb-3">
          We use a few trusted third-party services to provide core
          functionality:
        </p>
        <div className="space-y-3 ml-4">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-700/30">
            <p className="text-sm font-semibold text-cyan-300 mb-1">
              BetterAuth (authentication)
            </p>
            <p className="text-sm text-gray-300">
              Handles sign-up, login, and session management. We may also offer
              sign-in via providers such as Google or Discord, which share only
              the information needed to create your account.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-700/30">
            <p className="text-sm font-semibold text-cyan-300 mb-1">
              Cloudinary (profile pictures)
            </p>
            <p className="text-sm text-gray-300">
              Stores and serves profile images you upload.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-700/30">
            <p className="text-sm font-semibold text-cyan-300 mb-1">
              YGOProDeck API (card data)
            </p>
            <p className="text-sm text-gray-300">
              Provides card names, images, and metadata used across the
              platform. We do not send your personal data to this service.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-cyan-950/30 rounded-lg border border-cyan-600/30 p-5">
        <div className="flex items-center gap-3 mb-4">
          <Cookie className="w-6 h-6 text-cyan-400" aria-hidden="true" />
          <h4 className="text-xl font-semibold text-white">5. Cookies</h4>
        </div>
        <p className="text-gray-300 leading-relaxed mb-3">
          We use cookies and similar technologies to keep you logged in and to
          protect against security threats. These are essential cookies; they
          do not track you across other websites.
        </p>
        <div className="space-y-3 ml-4">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-700/30">
            <p className="font-mono text-sm text-cyan-300 mb-1">
              better-auth.session_token
            </p>
            <p className="text-sm text-gray-300">
              Maintains your login session. Essential (HTTP-only, Secure).
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-700/30">
            <p className="font-mono text-sm text-cyan-300 mb-1">
              better-auth.csrf_token
            </p>
            <p className="text-sm text-gray-300">
              Protects against Cross-Site Request Forgery (CSRF) attacks.
            </p>
          </div>
        </div>
        <div className="bg-blue-900/30 rounded-lg p-3 mt-4 border border-blue-600/30">
          <p className="text-blue-200 text-sm">
            <strong>⚠️ Important:</strong> Blocking these cookies will prevent
            you from logging in and using authenticated features. You can
            manage cookies through your browser settings.
          </p>
        </div>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-white mb-3">
          6. Data Retention
        </h4>
        <p className="text-gray-300 leading-relaxed">
          We retain your data for as long as your account is active or as
          needed to provide the service. Anonymous view-tracking records are
          automatically removed after 30 days. You may request deletion of your
          account and associated data at any time.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-white mb-3">
          7. Your Rights
        </h4>
        <ul className="space-y-2 text-gray-300 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong>Access:</strong> request a copy of the data we hold about
              you
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong>Correction:</strong> update or correct inaccurate
              information
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong>Deletion:</strong> request removal of your account and
              data
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong>Objection:</strong> object to certain processing of your
              data
            </span>
          </li>
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-white mb-3">
          8. Children's Privacy
        </h4>
        <p className="text-gray-300 leading-relaxed">
          Masterduel Counter is not directed at children under the age of 13.
          We do not knowingly collect personal information from children. If
          you believe a child has provided us with personal information, please
          contact us so we can remove it.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-white mb-3">
          9. Changes to This Policy
        </h4>
        <p className="text-gray-300 leading-relaxed">
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by updating the "Last updated" date at the top of
          this page. Continued use of the service after changes constitutes
          acceptance of the updated policy.
        </p>
      </section>

      <div className="text-center pt-4 border-t border-blue-600/30">
        <p className="text-gray-400 text-sm">
          If you have questions about this Privacy Policy, please contact us
          through the Contact section of the site.
        </p>
      </div>
    </div>
  );
};