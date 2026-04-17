import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import SuperAdminDashboard from './SuperAdminDashboard';
import ClientDashboard from './ClientDashboard';
import ClientSettings from './ClientSettings';
import SuperAdminSettings from './SuperAdminSettings';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen bg-dark-900 flex items-center justify-center text-primary-500">Loading Session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route index element={
          user.role === 'SUPER_ADMIN' ? <SuperAdminDashboard /> : <ClientDashboard />
        } />
        <Route path="settings" element={
          user.role === 'SUPER_ADMIN' ? <SuperAdminSettings /> : <ClientSettings />
        } />
      </Routes>
    </DashboardLayout>
  );
}
