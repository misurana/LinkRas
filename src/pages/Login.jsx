import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { loginClient } from '../utils/storage';
import bcrypt from 'bcryptjs';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, login, loading } = useAuth();

  // Redirect if already logged in (e.g., on page refresh)
  React.useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="h-screen bg-dark-900 flex items-center justify-center text-primary-500">Connecting...</div>;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Fetch Cloud Super Admin Config
    try {
      const { getSuperAdminConfig } = await import('../utils/storage');
      let cloudSA;
      try {
        cloudSA = await getSuperAdminConfig();
      } catch (dbErr) {
        console.error("DB Fetch Error:", dbErr);
      }

      const saUser = cloudSA?.username || 'mukesh';

      if (username.toLowerCase() === saUser.toLowerCase()) {
        if (!cloudSA) {
          setError('Super Admin account not initialized in Cloud.');
          return;
        }

        const isValid = await bcrypt.compare(password, cloudSA.password_hash);

        if (isValid) {
          login({ role: 'SUPER_ADMIN', username: saUser });
          navigate('/dashboard');
          return;
        } else {
          setError('Invalid username or password');
          return;
        }
      }
    } catch (saErr) {
      console.error("Cloud Admin Auth Error:", saErr);
    }

    try {
      const client = await loginClient(username);
      if (!client) {
        setError('Invalid username or password');
        return;
      }

      const isValid = await bcrypt.compare(password, client.password);
      if (isValid) {
        login({ role: 'CLIENT', id: client.id, name: client.name, username: client.username });
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch(err) {
      setError('Login failed due to an internal error.');
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center p-4 relative z-20">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md glass-panel rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 blur-[50px] pointer-events-none" />
        
        <div className="text-center mb-10 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to manage your menu</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-dark-900/50 border border-gray-700/50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 transition-all outline-none"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-900/50 border border-gray-700/50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
}
