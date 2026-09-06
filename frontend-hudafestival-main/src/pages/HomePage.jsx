import React from 'react';  
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <section 
            className="min-h-screen bg-cover bg-center grid grid-cols-1 md:grid-cols-1 " 
            style={{ backgroundImage: "url('/images/bg.jpg')" }}
        >
            <div className='min-h-screen grid place-items-center p-4 '>
            <div className="flex flex-col items-center text-center">
                
                <img 
                    src="/images/logo.png" 
                    alt="College Logo" 
                    className="w-62 mb-6 md:shadow-2xl" 
                />
                
                <h1 className="text-3xl md:text-5xl text-white font-extrabold font-[poppins] tracking-wider">
                    USTAVERSE'25 
                </h1>
                
                <h2 className="mt-2 text-3xl md:text-4xl font-semibold font-[poppins] tracking-tight text-white">
                    Moyilarity and modernity
                </h2>

                {/* Optional: A Call-to-Action Button */}
                <div className="mt-10">
                    <Link
                        to="/leaderboards"
                        className="px-8 py-3 font-semibold text-yellow-600 bg-white rounded-md hover:bg-gray-200 transition-transform transform hover:scale-105"
                    >
                        #ExploreTheFestival
                    </Link>
                </div>
                </div>
            </div>
        </section>
    );
};

export default HomePage;

