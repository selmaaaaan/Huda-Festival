import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <header className="absolute top-0 left-0 w-full py-4 z-10">
            <nav className="container mx-auto px-4 grid justify-items-center">
                
                <ul className="bg-white/70 backdrop-blur-md p-2 rounded-full shadow-md flex items-center space-x-1">
                    <li>
                        <NavLink 
                            to="/" 
                            end
                            className={({ isActive }) => 
                                // THEME UPDATED: Changed from blue to yellow
                                `block px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                                    isActive ? 'bg-yellow-400 text-white shadow-sm' : 'text-yellow-600 hover:bg-yellow-100'
                                }`
                            }
                        >
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/leaderboards" 
                            className={({ isActive }) => 
                                // THEME UPDATED: Changed from blue to yellow
                                `block px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                                    isActive ? 'bg-yellow-400 text-white shadow-sm' : 'text-yellow-600 hover:bg-yellow-100'
                                }`
                            }
                        >
                            Leaderboards
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/programmes" 
                            className={({ isActive }) => 
                                // THEME UPDATED: Changed from blue to yellow
                                `block px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                                    isActive ? 'bg-yellow-400 text-white shadow-sm' : 'text-yellow-600 hover:bg-yellow-100'
                                }`
                            }
                        >
                            Programmes
                        </NavLink>
                    </li>
                    {/* <li>
                        <NavLink 
                            to="/controllers" 
                            className={({ isActive }) => 
                                // THEME UPDATED: Changed from blue to yellow
                                `block px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                                    isActive ? 'bg-yellow-400 text-white shadow-sm' : 'text-yellow-600 hover:bg-yellow-100'
                                }`
                            }
                        >
                            Coordinators
                        </NavLink>
                    </li> */}
                    <li>
                        <NavLink 
                            to="/search" 
                            className={({ isActive }) => 
                                // THEME UPDATED: Changed from blue to yellow
                                `block px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                                    isActive ? 'bg-yellow-400 text-white shadow-sm' : 'text-yellow-600 hover:bg-yellow-100'
                                }`
                            }
                        >
                             <i className="fa fa-search"></i>
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;

