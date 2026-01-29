export const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-blue-800 mt-8" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-lg text-white">Masterduel Counter</span>
          </div>

          <nav className="flex items-center space-x-6 text-sm" aria-label="Footer navigation">
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200" aria-label="About Masterduel Counter">
              About
            </a>
            <span className="text-blue-700" aria-hidden="true">•</span>
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200" aria-label="Contact us">
              Contact
            </a>
            <span className="text-blue-700" aria-hidden="true">•</span>
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200" aria-label="Get help">
              Help
            </a>
          </nav>

          <p className="text-sm text-blue-500">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};