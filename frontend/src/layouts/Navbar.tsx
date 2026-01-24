export const Navbar = () => {
  return (
    <header className="bg-slate-900 border-b border-blue-800 sticky top-0 z-10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg shadow-md"></div>
          <h1 className="text-2xl font-bold text-white">Masterduel Counter</h1>
        </div>
      </div>
    </header>
  );
};
