/**
 * QUOTE OF THE DAY STORAGE
 * 
 * Uses Capacitor Preferences for native storage with localStorage fallback for web.
 * Stores the selected quote with today's date to ensure it persists across app sessions.
 */

import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { Quote, loadQuotes } from './quotes';

const QOTD_KEY = 'quote_of_the_day';
const QOTD_DATE_KEY = 'quote_of_the_day_date';

interface StoredQOTD {
  quote: Quote;
  date: string; // YYYY-MM-DD format
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Check if we're running on a native platform
 */
function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get stored QOTD from storage
 */
async function getStoredQOTD(): Promise<StoredQOTD | null> {
  try {
    let value: string | null = null;
    
    if (isNative()) {
      const result = await Preferences.get({ key: QOTD_KEY });
      value = result.value;
    } else {
      value = localStorage.getItem(QOTD_KEY);
    }
    
    if (value) {
      const parsed = JSON.parse(value) as StoredQOTD;
      // Validate the stored data has required fields
      if (parsed && parsed.quote && parsed.date) {
        console.log('[QOTD] Found stored quote for date:', parsed.date);
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[QOTD] Failed to get stored QOTD:', e);
  }
  return null;
}

/**
 * Save QOTD to storage
 */
async function saveQOTD(data: StoredQOTD): Promise<void> {
  try {
    const value = JSON.stringify(data);
    console.log('[QOTD] Saving quote for date:', data.date);
    
    if (isNative()) {
      await Preferences.set({ key: QOTD_KEY, value });
    } else {
      localStorage.setItem(QOTD_KEY, value);
    }
    
    console.log('[QOTD] Successfully saved to storage');
  } catch (e) {
    console.warn('[QOTD] Failed to save QOTD:', e);
  }
}

/**
 * Get Quote of the Day
 * 
 * - First checks if a quote is already stored for today
 * - If not, randomly selects a quote and saves it
 * - Returns the same quote for the entire day
 */
export async function getQuoteOfTheDay(): Promise<Quote | null> {
  const today = getTodayDateString();
  console.log('[QOTD] Getting quote for today:', today);
  
  // Check if we have a stored quote for today
  const stored = await getStoredQOTD();
  
  if (stored && stored.date === today && stored.quote) {
    console.log('[QOTD] Using stored quote from today');
    return stored.quote;
  }
  
  console.log('[QOTD] No valid quote for today, selecting new one');
  
  // No quote for today, select a new one
  const allQuotes = await loadQuotes();
  if (allQuotes.length === 0) {
    console.log('[QOTD] No quotes available');
    return null;
  }
  
  // Randomly select a quote
  const randomIndex = Math.floor(Math.random() * allQuotes.length);
  const selectedQuote = allQuotes[randomIndex];
  
  console.log('[QOTD] Selected new quote:', selectedQuote.id);
  
  // Save it with today's date
  await saveQOTD({
    quote: selectedQuote,
    date: today
  });
  
  return selectedQuote;
}

/**
 * Force refresh the Quote of the Day (for development only)
 * This bypasses the date check and selects a new random quote
 */
export async function forceRefreshQOTD(): Promise<Quote | null> {
  const allQuotes = await loadQuotes();
  if (allQuotes.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * allQuotes.length);
  const selectedQuote = allQuotes[randomIndex];
  const today = getTodayDateString();
  
  await saveQOTD({
    quote: selectedQuote,
    date: today
  });
  
  return selectedQuote;
}

/**
 * Clear stored QOTD (for testing)
 */
export async function clearQOTD(): Promise<void> {
  try {
    if (isNative()) {
      await Preferences.remove({ key: QOTD_KEY });
    } else {
      localStorage.removeItem(QOTD_KEY);
    }
  } catch (e) {
    console.warn('Failed to clear QOTD:', e);
  }
}
