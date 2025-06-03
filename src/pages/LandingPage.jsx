import React from 'react';
import carimage from "./../images/car_image.jpg" // Adjust the path as necessary
import { Link } from 'react-router-dom';
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#e6f2e4]">
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-5 bg-white shadow-md">
        <div className="text-green-700 font-bold text-xl">YOUR LOGO</div>
        <nav className="space-x-6 text-gray-700 font-medium hidden md:flex">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Service</a>
          <a href="#">Contact</a>
        </nav>
        <div className="space-x-3">
            <Link
                to="/signup"
                className="px-4 py-1 border border-green-600 text-green-600 rounded-full hover:bg-green-100"
                >
                Sign up
                </Link>

                <Link to="/login"
                className="px-4 py-1 bg-green-600 text-white rounded-full hover:bg-green-700"
                >
                Sign in
            </Link>
        </div>
      </header>
      {/* Hero Section */}
      <main className="flex flex-col md:flex-row justify-between items-center px-8 py-16 bg-white">
        {/* Left Content */}
        <div className="max-w-xl mb-10 md:mb-0">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            CHARGING <span className="text-green-600">STATION</span>
          </h1>
          <p className="text-gray-600 mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <button className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition">Learn More →</button>
        </div>

        {/* Right Illustration */}
        <div className="w-full md:w-1/2">
          <img src={carimage} alt="Charging Station Illustration" className="w-full" />
        </div>
      </main>

      {/* Dots or Controls */}
      <div className="flex justify-center gap-3 py-4">
        <div className="w-3 h-3 bg-green-300 rounded-full" />
        <div className="w-3 h-3 bg-green-600 rounded-full" />
        <div className="w-3 h-3 bg-green-300 rounded-full" />
      </div>
    </div>
  );
};

export default LandingPage;
