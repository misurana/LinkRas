import React, { useState, useEffect } from 'react';
import { User, Shield, HardDrive, Save, Download, RotateCcw, AlertTriangle, Monitor } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRestaurant, updateRestaurantDetails, updateRestaurantMenu } from '../utils/storage';
import bcrypt from 'bcryptjs';
import Modal from '../components/Modal';
import { useTheme } from '../context/ThemeContext';

export default function ClientSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [restaurantData, setRestaurantData] = useState(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (user?.id) {
      getRestaurant(user.id).then(data => setRestaurantData(data));
    }
  }, [user]);

  if (!restaurantData) return <div className="p-8 text-gray-500">Loading settings...</div>;

  const tabs = [
    { id: 'profile', name: 'Profile & Theme', icon: <User className="w-5 h-5"/> },
    { id: 'data', name: 'Data & Backup', icon: <HardDrive className="w-5 h-5"/> }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Settings Navigation */}
      <div className="w-full md:w-64 space-y-2 flex-shrink-0">
        <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
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

      {/* Settings Content */}
      <div className="flex-1 glass-panel rounded-2xl p-6 md:p-8">
        {activeTab === 'profile' && <ProfileThemeSettings theme={theme} toggleTheme={toggleTheme} restaurant={restaurantData} />}
        {activeTab === 'data' && <DataBackupSettings restaurant={restaurantData} />}
      </div>
    </div>
  );
}

function ProfileThemeSettings({ restaurant, theme, toggleTheme }) {
  const [themeMode, setThemeMode] = useState(restaurant.theme || theme);
  const [isSaving, setIsSaving] = useState(false);

  // Persist theme to both global UI and restaurant data
  const handleSave = async () => {
    setIsSaving(true);
    toggleTheme(themeMode);
    
    try {
      await updateRestaurantDetails(restaurant.id, { theme: themeMode });
      setTimeout(() => {
        setIsSaving(false);
        alert('Theme settings updated successfully!');
      }, 500);
    } catch (error) {
      console.error(error);
      setIsSaving(false);
      alert('Failed to save theme settings.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Theme Settings</h3>
        <p className="text-gray-400 text-sm">Customize how your Digital Menu looks to your customers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-300">Light / Dark Mode</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" value="dark" checked={themeMode === 'dark'} onChange={() => setThemeMode('dark')} className="accent-primary-500 w-4 h-4" />
              <span className="text-white group-hover:text-primary-300 transition-colors">Dark Mode</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" value="light" checked={themeMode === 'light'} onChange={() => setThemeMode('light')} className="accent-primary-500 w-4 h-4" />
              <span className="text-white group-hover:text-primary-300 transition-colors">Light Mode</span>
            </label>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/10 flex justify-end">
        <button onClick={handleSave} className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg flex items-center gap-2 transition-all active:scale-95">
          <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}

// Security settings removed for clients


function DataBackupSettings({ restaurant }) {
  const [isResetModalOpen, setResetModalOpen] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(restaurant.menu, null, 2));
    const exportNode = document.createElement('a');
    exportNode.setAttribute("href", dataStr);
    exportNode.setAttribute("download", `Menu_Backup_${restaurant.name}.json`);
    document.body.appendChild(exportNode);
    exportNode.click();
    exportNode.remove();
  };

  const confirmResetMenu = async () => {
    await updateRestaurantMenu(restaurant.id, []);
    setResetModalOpen(false);
    alert('Menu has been wiped clean.');
    // Ideally trigger an app refresh here
    window.location.reload();
  };

  const undoLastSave = () => {
    alert('Undo snapshot restore triggered! (Note: Snapshot architecture required to implement full history rollout)');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Data & Backup</h3>
        <p className="text-gray-400 text-sm">Helps prevent mistakes and adds trust. Export or restore your digital menu data.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between p-4 bg-dark-900/30 border border-white/5 rounded-xl">
           <div>
             <h4 className="font-semibold text-white">Auto-Save Protocol</h4>
             <p className="text-sm text-gray-400">Automatically save menu edits without pressing "Save"</p>
           </div>
           <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={autoSave} onChange={() => setAutoSave(!autoSave)} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
           </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
           <button onClick={exportJSON} className="flex-1 flex items-center justify-center gap-2 bg-dark-800 hover:bg-dark-700 border border-white/10 text-white py-3 rounded-xl transition-colors text-sm font-medium">
             <Download className="w-4 h-4" /> Export Menu (JSON)
           </button>
           
           <button onClick={undoLastSave} className="flex-1 flex items-center justify-center gap-2 bg-dark-800 hover:bg-dark-700 border border-white/10 text-white py-3 rounded-xl transition-colors text-sm font-medium">
             <RotateCcw className="w-4 h-4" /> Undo Last Save
           </button>
        </div>

        <div className="mt-8 pt-8 border-t border-red-500/20">
           <div className="mb-4">
             <h4 className="font-semibold text-red-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Danger Zone</h4>
             <p className="text-sm text-gray-400">Proceed with extreme caution. This will permanently erase your public digital menu.</p>
           </div>
           <button onClick={() => setResetModalOpen(true)} className="w-full md:w-auto px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-colors font-medium">
             Factory Reset Data
           </button>
        </div>
      </div>

      <Modal isOpen={isResetModalOpen} onClose={() => setResetModalOpen(false)} title="Reset Entire Digital Menu">
        <div className="space-y-6">
          <p className="text-gray-300">
            Are you sure you want to <strong className="text-red-400">wip clean all your menu items</strong>? 
            This action cannot be undone. Customers will immediately see an empty menu.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setResetModalOpen(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors">
              Cancel
            </button>
            <button onClick={confirmResetMenu} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-white font-medium shadow-lg shadow-red-500/20 transition-colors">
              Yes, Destroy Data
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
