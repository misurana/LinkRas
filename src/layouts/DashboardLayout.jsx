import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();

  return (
    <div className="flex w-full h-screen bg-dark-900 relative overflow-hidden text-gray-100">
      
      {/* Background ambient accents for the dashboard */}
      <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-accent-500/10 blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <Sidebar role={user?.role} />

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto relative z-10 scrollbar-hide">
        {children}
      </div>
    </div>
  );
}
