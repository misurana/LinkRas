import { openDB } from 'idb';
import { createRestaurant, checkUsernameExists } from './storage';

/**
 * Migration Utility
 * Reads data from IndexedDB and pushes it to Supabase
 */
export const migrateLocalToCloud = async () => {
  const DB_NAME = 'LinkRasDB';
  const DB_VERSION = 1;

  try {
    const db = await openDB(DB_NAME, DB_VERSION);
    if (!db.objectStoreNames.contains('restaurants')) {
      return { success: false, message: "No local data found to migrate." };
    }

    const localRestaurants = await db.getAll('restaurants');
    if (localRestaurants.length === 0) {
      return { success: false, message: "No restaurants found in local storage." };
    }

    let migratedCount = 0;
    let skippedCount = 0;

    for (const rest of localRestaurants) {
      // Check if already exists in Supabase to avoid duplicates
      const exists = await checkUsernameExists(rest.username);
      if (!exists) {
        // Prepare data for Supabase (ensure it matches schema)
        const cloudData = {
          id: rest.id,
          name: rest.name,
          username: rest.username,
          password: rest.password, // This is already hashed from our previous work
          menu: rest.menu || [],
          theme: rest.theme || 'dark',
          logo: rest.logo || null,
          created_at: rest.createdAt || new Date().toISOString()
        };

        await createRestaurant(cloudData);
        migratedCount++;
      } else {
        skippedCount++;
      }
    }

    return { 
      success: true, 
      message: `Migration complete! Migrated: ${migratedCount}, Skipped (Already in Cloud): ${skippedCount}` 
    };

  } catch (error) {
    console.error("Migration Error:", error);
    return { success: false, message: "Migration failed. See console for details." };
  }
};
