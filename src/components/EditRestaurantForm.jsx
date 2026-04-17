import React, { useState } from 'react';
import bcrypt from 'bcryptjs';
import { updateRestaurantDetails, checkUsernameExists } from '../utils/storage';
import { Loader2 } from 'lucide-react';

export default function EditRestaurantForm({ restaurant, onSuccess }) {
  const [formData, setFormData] = useState({ 
    name: restaurant.name, 
    username: restaurant.username, 
    password: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check username if changed
      if (formData.username !== restaurant.username) {
        const exists = await checkUsernameExists(formData.username);
        if (exists) {
          setError('Username already exists. Choose another.');
          setLoading(false);
          return;
        }
      }

      const updates = {
        name: formData.name,
        username: formData.username
      };

      // Only hash and update password if it was filled out
      if (formData.password.trim()) {
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(formData.password, salt);
      }

      await updateRestaurantDetails(restaurant.id, updates);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('Failed to update restaurant.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Restaurant Name</label>
        <input 
          type="text" 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full bg-dark-900/50 border border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-2.5 px-3 text-white placeholder-gray-500 outline-none"
          placeholder="e.g. Mukesh Dhaba"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Admin Username</label>
        <input 
          type="text" 
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
          required
          className="w-full bg-dark-900/50 border border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-2.5 px-3 text-white placeholder-gray-500 outline-none"
          placeholder="unique_username"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">New Password (leave blank to keep current)</label>
        <input 
          type="password" 
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          minLength={6}
          className="w-full bg-dark-900/50 border border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl py-2.5 px-3 text-white placeholder-gray-500 outline-none"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20 active:scale-[0.98] flex justify-center items-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
      </button>
    </form>
  );
}
