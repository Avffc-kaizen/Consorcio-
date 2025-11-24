
import React from 'react';
import { Link, NavLink } from 'react-router-dom';

interface NavigationProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ isAuthenticated, onLogout }) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo Area */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 shadow-lg shadow-slate-900/20 transition-transform group-hover:scale-105 group-active:scale-95 border border-slate-800">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 tracking-tight leading-none group-hover:text-blue-900 transition-colors">Aquisição Estratégica</span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-6">
                   {isAuthenticated && (
                      <>
                           <NavLink 
                                to="/dashboard"
                                className={({ isActive }) => 
                                    `text-sm font-bold transition-all duration-200 ${
                                        isActive 
                                        ? 'text-slate-900 border-b-2 border-slate-900 pb-0.5' 
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`
                                }
                            >
                                Meu Portfólio
                            </NavLink>
                            <div className="h-4 w-px bg-slate-200"></div>
                            <button 
                                onClick={onLogout}
                                className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                            >
                                Sair
                            </button>
                      </>
                  )}
              </nav>
              
              {/* Mobile Menu Button (Simplified) */}
              <div className="md:hidden">
                  {isAuthenticated && (
                       <NavLink to="/dashboard" className="p-2 text-slate-900"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></NavLink>
                  )}
              </div>
            </div>
      </div>
    </header>
  );
};
