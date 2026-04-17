import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Store, QrCode } from 'lucide-react';
import { getAllRestaurants, deleteRestaurant } from '../utils/storage';
import Modal from '../components/Modal';
import CreateRestaurantForm from '../components/CreateRestaurantForm';
import EditRestaurantForm from '../components/EditRestaurantForm';

export default function SuperAdminDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getAllRestaurants();
    setRestaurants(data);
  };

  const handleCreated = () => {
    setCreateModalOpen(false);
    fetchData();
  };

  const handleEdited = () => {
    setEditModalOpen(false);
    setSelectedForEdit(null);
    fetchData();
  };

  const confirmDelete = async () => {
    if (selectedForDeletion) {
      await deleteRestaurant(selectedForDeletion.id);
      setDeleteModalOpen(false);
      setSelectedForDeletion(null);
      fetchData();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Active Restaurants</h1>
          <p className="text-gray-400 mt-1">Manage client profiles and QR codes.</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Restaurant
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {restaurants.map((rest) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={rest.id}
              className="glass-panel p-6 rounded-2xl flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-500/20 text-primary-400 rounded-xl flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{rest.name}</h3>
                    <p className="text-xs text-gray-500">@{rest.username}</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-6 font-mono truncate bg-black/20 p-2 rounded-lg">
                ID: {rest.id}
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-4">
                <button className="text-xs flex items-center gap-1.5 text-accent-400 hover:text-accent-300 transition-colors">
                  <QrCode className="w-4 h-4" /> Export QR
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedForEdit(rest);
                      setEditModalOpen(true);
                    }}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedForDeletion(rest);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {restaurants.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-500 font-medium">
              No restaurants found. Create one to get started.
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Creation Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="New Restaurant">
        <CreateRestaurantForm onSuccess={handleCreated} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => {
        setEditModalOpen(false);
        setSelectedForEdit(null);
      }} title="Edit Restaurant">
        {selectedForEdit && (
          <EditRestaurantForm restaurant={selectedForEdit} onSuccess={handleEdited} />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="space-y-6">
          <p className="text-gray-300">
            Are you sure you want to delete <strong className="text-white">{selectedForDeletion?.name}</strong>? 
            This will permanently remove the restaurant and all associated menu data from the database.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors">
              Cancel
            </button>
            <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-white font-medium shadow-lg shadow-red-500/20 transition-colors">
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
