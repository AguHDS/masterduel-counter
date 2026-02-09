import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-10 relative">
          <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 opacity-20">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              404
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-5">
          Page Not Found
        </h1>
        <p className="text-gray-700 mb-10 text-lg leading-relaxed">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>

        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-lg font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 group"
          >
            <span className="border-b-2 border-transparent group-hover:border-blue-600 transition-all duration-200 pb-1">
              Go Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
