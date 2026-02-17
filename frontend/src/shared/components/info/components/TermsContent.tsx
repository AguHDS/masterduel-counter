import { Shield, Cookie, Lock, FileText } from "lucide-react";

export const TermsContent = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-950/30 rounded-lg border border-blue-600/30 p-4">
        <div className="flex items-center gap-3 mb-3">
          <FileText className="w-6 h-6 text-blue-400" aria-hidden="true" />
          <h3 className="text-xl font-semibold text-white">Terms of Service</h3>
        </div>
        <p className="text-gray-300 text-sm mb-4">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <section>
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" aria-hidden="true" />
          1. Acceptance of Terms
        </h4>
        <p className="text-gray-300 leading-relaxed">
          By accessing and using Masterduel Counter, you accept and agree to be bound by the terms and 
          provision of this agreement. If you do not agree to these terms, please do not use this service.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Lock className="w-5 h-5 text-purple-400" aria-hidden="true" />
          2. User Accounts
        </h4>
        <p className="text-gray-300 leading-relaxed mb-2">
          When you create an account with us, you must provide information that is accurate, complete, 
          and current at all times. Failure to do so constitutes a breach of the Terms.
        </p>
        <ul className="space-y-2 text-gray-300 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>You are responsible for safeguarding your account credentials</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>You must notify us immediately of any unauthorized access</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>You are responsible for all activities under your account</span>
          </li>
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-white mb-3">3. User Content</h4>
        <p className="text-gray-300 leading-relaxed mb-2">
          Users can create and share archetype counter guides. By posting content, you grant us a 
          non-exclusive, worldwide, royalty-free license to use, display, and distribute your content 
          on the platform.
        </p>
        <div className="bg-yellow-950/20 border border-yellow-600/30 rounded-lg p-3 mt-3">
          <p className="text-yellow-200 text-sm">
            <strong>Content Guidelines:</strong> Prohibited content includes offensive material, spam, 
            harassment, or any content that violates third-party rights.
          </p>
        </div>
      </section>

      <section className="bg-cyan-950/30 rounded-lg border border-cyan-600/30 p-5">
        <div className="flex items-center gap-3 mb-4">
          <Cookie className="w-6 h-6 text-cyan-400" aria-hidden="true" />
          <h4 className="text-xl font-semibold text-white">Cookie Policy</h4>
        </div>
        
        <h5 className="text-md font-semibold text-white mb-2">What are cookies?</h5>
        <p className="text-gray-300 leading-relaxed mb-4">
          Cookies are small text files stored on your device that help us provide and improve our service.
        </p>

        <h5 className="text-md font-semibold text-white mb-2">Authentication Cookies (BetterAuth)</h5>
        <p className="text-gray-300 leading-relaxed mb-3">
          We use <strong className="text-cyan-300">BetterAuth</strong> for secure authentication. 
          The following cookies are essential for the service to function:
        </p>
        
        <div className="space-y-3 ml-4">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-700/30">
            <p className="font-mono text-sm text-cyan-300 mb-1">better-auth.session_token</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li><strong>Purpose:</strong> Maintains your login session</li>
              <li><strong>Type:</strong> Essential (HTTP-only, Secure)</li>
              <li><strong>Duration:</strong> Session-based or as configured</li>
              <li><strong>Security:</strong> Encrypted and protected against XSS attacks</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-700/30">
            <p className="font-mono text-sm text-cyan-300 mb-1">better-auth.csrf_token</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li><strong>Purpose:</strong> Protects against Cross-Site Request Forgery (CSRF) attacks</li>
              <li><strong>Type:</strong> Essential (Security)</li>
              <li><strong>Duration:</strong> Session-based</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-900/30 rounded-lg p-3 mt-4 border border-blue-600/30">
          <p className="text-blue-200 text-sm">
            <strong>⚠️ Important:</strong> These authentication cookies are strictly necessary for the 
            service to work. Blocking them will prevent you from logging in and using authenticated features.
          </p>
        </div>

        <h5 className="text-md font-semibold text-white mb-2 mt-4">Managing Cookies</h5>
        <p className="text-gray-300 leading-relaxed">
          You can control cookies through your browser settings. However, disabling authentication 
          cookies will prevent you from accessing account-based features.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-white mb-3">4. Intellectual Property</h4>
        <p className="text-gray-300 leading-relaxed">
          Yu-Gi-Oh! and Master Duel are trademarks of Konami Digital Entertainment. This site is not 
          affiliated with or endorsed by Konami. All card images and related assets are property of their 
          respective owners.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-white mb-3">5. Limitation of Liability</h4>
        <p className="text-gray-300 leading-relaxed">
          Masterduel Counter is provided "as is" without warranties. We are not liable for any damages 
          arising from your use of the service, including but not limited to loss of data or interruption 
          of service.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-white mb-3">6. Changes to Terms</h4>
        <p className="text-gray-300 leading-relaxed">
          We reserve the right to modify these terms at any time. Continued use of the service after 
          changes constitutes acceptance of the new terms.
        </p>
      </section>

      <div className="text-center pt-4 border-t border-blue-600/30">
        <p className="text-gray-400 text-sm">
          By using Masterduel Counter, you acknowledge that you have read and understood these Terms of Service.
        </p>
      </div>
    </div>
  );
};
