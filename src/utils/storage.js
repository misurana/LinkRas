import { supabase } from '../lib/supabase';

/**
 * LinkRas Cloud Storage (Supabase)
 * This replaces the local IndexedDB implementation for Phase 2.
 */

export const createRestaurant = async (restaurantData) => {
  const { data, error } = await supabase
    .from('restaurants')
    .insert([restaurantData])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const getRestaurant = async (id) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'not found'
  return data;
};

export const getAllRestaurants = async () => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const deleteRestaurant = async (id) => {
  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const checkUsernameExists = async (username) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('id')
    .eq('username', username.toLowerCase())
    .maybeSingle();
  
  if (error) throw error;
  return !!data;
};

export const updateRestaurantMenu = async (id, newMenu) => {
  const { error } = await supabase
    .from('restaurants')
    .update({ menu: newMenu })
    .eq('id', id);
  
  if (error) throw error;
};

export const loginClient = async (username) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('username', username.toLowerCase())
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateRestaurantDetails = async (id, details) => {
  const { error } = await supabase
    .from('restaurants')
    .update(details)
    .eq('id', id);
  
  if (error) throw error;
};

/** 
 * Super Admin Logic (admin_settings table)
 */

export const getSuperAdminConfig = async () => {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('*')
    .eq('id', 'global_config')
    .single();
  
  if (error) throw error;
  return data;
};

export const updateSuperAdminConfig = async (username, passwordHash) => {
  const { error } = await supabase
    .from('admin_settings')
    .update({ 
      username, 
      password_hash: passwordHash,
      updated_at: new Date().toISOString()
    })
    .eq('id', 'global_config');
  
  if (error) throw error;
};
