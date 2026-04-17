import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Store, LogOut, LayoutDashboard, Settings, Utensils } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useAuth } from '../context/AuthContext';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Sidebar({ role = "SUPER_ADMIN" }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    {
      label: role === "SUPER_ADMIN" ? "Restaurants" : "Menu",
      icon: role === "SUPER_ADMIN" ? <Store className="w-5 h-5" /> : <Utensils className="w-5 h-5" />,
      path: "/dashboard",
      active: true // For now hardcoded to standard path
    },
    {
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
      path: "/dashboard/settings"
    }
  ];

  return (
    <div className="w-64 h-full glass-panel border-r border-white/5 border-t-0 border-l-0 border-b-0 flex flex-col pt-8 relative z-20">
      
      {/* Brand */}
      <div className="px-8 pb-8 flex items-center gap-3 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
          <LayoutDashboard className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">LinkRas</span>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 px-4 py-8 space-y-2">
        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Management
        </p>
        
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
              isActive 
                ? "bg-primary-500/20 text-primary-300 border border-primary-500/20" 
                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* User Status / Logout */}
      <div className="p-4 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-red-400 font-medium text-sm"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

    </div>
  );
}
