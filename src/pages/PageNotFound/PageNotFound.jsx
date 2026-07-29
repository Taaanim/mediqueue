import React from 'react';
import { Link } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';


const PageNotFound = () => {
  return (
    <div className="bg-slate-50 font-sans">
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-2xl w-full">
          
          {/* SVG Illustration */}
          <div className="mb-8 flex items-center justify-center">
            <img className='w-82' src="https://res.cloudinary.com/deqw8tu5v/image/upload/v1752883342/freepik_assistant_1752883111200-removebg-preview_paekv3.png" alt="" />
          </div>

          {/* Text Content */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 mb-3">
            Page Not Found
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-md mx-auto">
            Oops! The page you are looking for does not exist. It might have been moved or deleted.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center justify-center cursor-pointer gap-2 w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            <Link 
              to="/" 
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white bg-[#1e74d2] hover:bg-[#1e74d299] transition-all"
            >
              <Home className="w-5 h-5" />
              Take Me Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
