import React, { useState } from 'react';
import { User, Shield, HardDrive, Download, AlertTriangle, Save } from 'lucide-react';
import { getAllRestaurants } from '../utils/storage';
import Modal from '../components/Modal';
import bcrypt from 'bcryptjs';
import { useTheme } from '../context/ThemeContext';

export default function SuperAdminSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, toggleTheme } = useTheme();

  const tabs = [
    { id: 'profile', name: 'Profile & Theme', icon: <User className="w-5 h-5"/> },
    { id: 'security', name: 'Security & Access', icon: <Shield className="w-5 h-5"/> },
    { id: 'data', name: 'Data & Backup', icon: <HardDrive className="w-5 h-5"/> }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-64 space-y-2 flex-shrink-0">
        <h2 className="text-2xl font-bold text-white mb-6">Super Admin Settings</h2>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${
              activeTab === tab.id 
                ? "bg-primary-500/20 text-primary-300 border border-primary-500/20" 
                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      <div className="flex-1 glass-panel rounded-2xl p-6 md:p-8">
        {activeTab === 'profile' && <ProfileThemeSettings theme={theme} toggleTheme={toggleTheme} />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'data' && <DataBackupSettings />}
      </div>
    </div>
  );
}

function ProfileThemeSettings({ theme, toggleTheme }) {
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const handleSaveTheme = () => {
    toggleTheme(selectedTheme);
    alert('Theme preference saved!');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Super Admin Theme</h3>
        <p className="text-gray-400 text-sm">Customize the dashboard appearance.</p>
      </div>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">Light / Dark Mode</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="radio" value="dark" checked={selectedTheme === 'dark'} onChange={() => setSelectedTheme('dark')} className="accent-primary-500 w-4 h-4" />
            <span className="text-white group-hover:text-primary-300 transition-colors">Dark Mode</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="radio" value="light" checked={selectedTheme === 'light'} onChange={() => setSelectedTheme('light')} className="accent-primary-500 w-4 h-4" />
            <span className="text-white group-hover:text-primary-300 transition-colors">Light Mode</span>
          </label>
        </div>
      </div>
      <div className="pt-6 border-t border-white/10 flex justify-end">
        <button onClick={handleSaveTheme} className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg flex items-center gap-2 transition-colors">
          <Save className="w-4 h-4" /> Save Preferences
        </button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { getSuperAdminConfig } = await import('../utils/storage');
      const config = await getSuperAdminConfig();
      if (config) setUsername(config.username);
    } catch (err) {
      console.error("Failed to fetch admin config:", err);
    }
  };

  const handleSecurityUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    
    if (newPassword && newPassword !== confirmPassword) {
      return setStatus({ type: 'error', message: 'New passwords do not match' });
    }
    if (newPassword && newPassword.length < 6) {
      return setStatus({ type: 'error', message: 'Password must be at least 6 characters' });
    }
    if (!username.trim()) {
      return setStatus({ type: 'error', message: 'Username cannot be empty' });
    }

    setLoading(true);
    try {
      const { getSuperAdminConfig, updateSuperAdminConfig } = await import('../utils/storage');
      const cloudSA = await getSuperAdminConfig();
      
      const isValid = await bcrypt.compare(currentPassword, cloudSA.password_hash);

      if (!isValid) {
         setLoading(false);
         return setStatus({ type: 'error', message: 'Current password is incorrect' });
      }

      let newHash = cloudSA.password_hash;
      if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        newHash = await bcrypt.hash(newPassword, salt);
      }
      
      await updateSuperAdminConfig(username.toLowerCase().trim(), newHash);
      
      setStatus({ type: 'success', message: 'Cloud security settings updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Failed to update cloud security settings.' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Security & Access</h3>
        <p className="text-gray-400 text-sm">Super Admin credentials management.</p>
      </div>

      <form onSubmit={handleSecurityUpdate} className="space-y-5 max-w-md">
        {status.message && (
           <div className={`p-3 rounded-lg text-sm border ${status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
             {status.message}
           </div>
        )}

        <div>
           <label className="block text-sm font-medium text-gray-300 mb-1">Admin Username</label>
           <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-dark-900/50 border border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-2.5 px-3 text-white outline-none" placeholder="mukesh" />
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-300 mb-1">Current Password (Required to save changes)</label>
           <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-dark-900/50 border border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-2.5 px-3 text-white outline-none" placeholder="••••••••" />
        </div>
        
        <div className="pt-4 border-t border-white/5">
           <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider font-semibold">Change Password (Optional)</p>
           <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-dark-900/50 border border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-2.5 px-3 text-white outline-none" placeholder="Leave blank to keep current" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-dark-900/50 border border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-2.5 px-3 text-white outline-none" placeholder="••••••••" />
             </div>
           </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-[0.98] flex items-center justify-center gap-2">
          {loading ? "Updating..." : "Update Security Settings"}
        </button>
      </form>
    </div>
  );
}

function DataBackupSettings() {
  const [isResetModalOpen, setResetModalOpen] = useState(false);

  const exportAllData = async () => {
    const allRestaurants = await getAllRestaurants();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allRestaurants, null, 2));
    const exportNode = document.createElement('a');
    exportNode.setAttribute("href", dataStr);
    exportNode.setAttribute("download", `LinkRas_Platform_Backup.json`);
    document.body.appendChild(exportNode);
    exportNode.click();
    exportNode.remove();
  };

  const confirmResetDatabase = async () => {
    // Highly destructive: erase cloud table
    if (!window.confirm("CRITICAL: This will wipe ALL cloud data. Are you sure?")) return;
    
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.from('restaurants').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (error) throw error;
      setResetModalOpen(false);
      alert('PLATFORM RESET: All cloud restaurants and menus have been wiped.');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to reset database.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Platform Data & Backup</h3>
        <p className="text-gray-400 text-sm">Manage entire LinkRas platform database.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
           <button onClick={exportAllData} className="flex-1 flex items-center justify-center gap-2 bg-dark-800 hover:bg-dark-700 border border-white/10 text-white py-3 rounded-xl transition-colors text-sm font-medium">
             <Download className="w-4 h-4" /> Export All Restaurants (JSON)
           </button>
        </div>

        <div className="mt-8 pt-8 border-t border-red-500/20">
           <div className="mb-4">
             <h4 className="font-semibold text-red-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Danger Zone</h4>
             <p className="text-sm text-gray-400">This will permanently erase ALL clients and menus from the database.</p>
           </div>
           <button onClick={() => setResetModalOpen(true)} className="w-full md:w-auto px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-colors font-medium">
             Wipe Entire Database
           </button>
        </div>
      </div>

      <Modal isOpen={isResetModalOpen} onClose={() => setResetModalOpen(false)} title="CRITICAL: Destroy All Data">
        <div className="space-y-6">
          <p className="text-gray-300">
            Are you absolutely sure you want to <strong className="text-red-400">wipe all restaurants and their menus</strong>? 
            This action cannot be undone. All active QR codes will break instantly.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setResetModalOpen(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors">
              Cancel
            </button>
            <button onClick={confirmResetDatabase} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-white font-medium shadow-lg shadow-red-500/20 transition-colors">
              Yes, Destroy Platform Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
