import { Layers } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-blue-800 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-lg text-white">Masterduel Counter</span>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
              About
            </a>
            <span className="text-blue-700">•</span>
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
              Contact
            </a>
            <span className="text-blue-700">•</span>
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
              Help
            </a>
          </div>

          <p className="text-sm text-blue-500">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};