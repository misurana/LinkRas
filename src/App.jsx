import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerMenu from './pages/CustomerMenu';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Hide welcome screen after 3 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
    <AuthProvider>
    <Router>
      <div className="min-h-screen bg-dark-900 border-none flex flex-col relative overflow-hidden">
        
        {/* Global Ambient Gradient Backgrounds */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/10 blur-[120px] pointer-events-none" />

        <AnimatePresence>
          {showWelcome && <WelcomeScreen key="welcome" />}
        </AnimatePresence>

        {!showWelcome && (
          <div className="flex-1 z-10 w-full relative">
            <Routes>
              {/* Root route immediately redirects to login since the welcome animation already played */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/menu/:restaurantId" element={<CustomerMenu />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
