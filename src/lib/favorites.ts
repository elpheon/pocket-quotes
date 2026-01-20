/**
 * FAVORITES MANAGER
 * 
 * Handles local storage of favorited quotes.
 * Favorites persist across app restarts.
 * No account required - all data stays on device.
 */

const FAVORITES_KEY = 'outofpocket_favorites';

/**
 * Get all favorited quote IDs
 */
export function getFavoriteIds(): Set<string> {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      const ids = JSON.parse(stored);
      return new Set(ids);
    }
  } catch (e) {
    console.warn('Failed to read favorites:', e);
  }
  return new Set();
}

/**
 * Save favorite IDs to local storage
 */
function saveFavoriteIds(ids: Set<string>): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...ids]));
  } catch (e) {
    console.warn('Failed to save favorites:', e);
  }
}

/**
 * Check if a quote is favorited
 */
export function isFavorite(quoteId: string): boolean {
  return getFavoriteIds().has(quoteId);
}

/**
 * Toggle favorite status for a quote
 * Returns the new favorite state
 */
export function toggleFavorite(quoteId: string): boolean {
  const ids = getFavoriteIds();
  
  if (ids.has(quoteId)) {
    ids.delete(quoteId);
    saveFavoriteIds(ids);
    return false;
  } else {
    ids.add(quoteId);
    saveFavoriteIds(ids);
    return true;
  }
}

/**
 * Remove a quote from favorites
 */
export function removeFavorite(quoteId: string): void {
  const ids = getFavoriteIds();
  ids.delete(quoteId);
  saveFavoriteIds(ids);
}

/**
 * Clean up favorites that no longer exist in quotes list
 * Call this after loading quotes to remove orphaned favorites
 */
export function cleanupFavorites(validQuoteIds: Set<string>): void {
  const favorites = getFavoriteIds();
  let changed = false;
  
  for (const id of favorites) {
    if (!validQuoteIds.has(id)) {
      favorites.delete(id);
      changed = true;
    }
  }
  
  if (changed) {
    saveFavoriteIds(favorites);
  }
}
