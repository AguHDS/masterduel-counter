import { Search, Layers } from 'lucide-react';
import { useState } from 'react';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-blue-950 flex flex-col">
      <header className="bg-slate-900 border-b border-blue-800 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg shadow-md">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Masterduel Counter
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl shadow-2xl border border-blue-700 overflow-hidden flex flex-col min-h-[600px]">
          <div className="bg-slate-800 border-b border-blue-700 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for cards..."
                  className="block w-full pl-10 pr-4 py-2.5 text-sm bg-slate-700 border border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-blue-400 hover:bg-slate-650"
                />
              </div>

              <button className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 font-medium text-sm whitespace-nowrap">
                <Layers className="w-4 h-4" />
                <span>Listed Decks</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-8 overflow-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-br from-blue-800 to-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-blue-600">
                  <Layers className="w-10 h-10 text-blue-300" />
                </div>
                <p className="text-blue-200 text-lg font-medium">
                  Card collection will appear here
                </p>
                <p className="text-blue-400 text-sm">
                  Use the search bar above to find your favorite cards
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

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
              © 2026 All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
