/**
 * QUOTE DATA LOADER
 *
 * This module handles loading quotes from your Google Sheet.
 *
 * HOW TO SET UP YOUR GOOGLE SHEET:
 * 1. Create a Google Sheet with these columns (in row 1):
 *    - id (required): Unique identifier for each quote
 *    - text (required): The quote text
 *    - author (optional): Who said it
 *    - tags (optional): Comma-separated tags like "funny,savage,relatable"
 *
 * 2. Publish your sheet:
 *    - File → Share → Publish to web
 *    - Select your sheet tab
 *    - Choose "Comma-separated values (.csv)"
 *    - Click Publish and copy the URL
 *
 * 3. Replace the GOOGLE_SHEET_CSV_URL below with your published URL
 *
 * UPDATING QUOTES:
 * - Simply update your Google Sheet
 * - The app will fetch the latest quotes on next launch
 * - Cached quotes are used offline or while fetching fails
 */

export interface Quote {
  id: string;
  text: string;
  author?: string;
  tags?: string[];
}

// ============================================
// REPLACE THIS URL WITH YOUR GOOGLE SHEET CSV
// ============================================
const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8rg7E0MVFPyot1l43XKmPB-_ERPNX5bp05FQ7wKR2bf58OOqB_7dyXYr30XVADfoG6M6UROInHjIq/pub?gid=0&single=true&output=csv";

// Local storage key for caching
const CACHE_KEY = "outofpocket_quotes_cache";
const CACHE_TIMESTAMP_KEY = "outofpocket_quotes_timestamp";

// Sample quotes for development/demo (used when no Google Sheet URL is set)
const SAMPLE_QUOTES: Quote[] = [
  {
    id: "1",
    text: "I'm not arguing, I'm just explaining why I'm right.",
    author: "Anonymous",
    tags: ["savage", "funny"],
  },
  {
    id: "2",
    text: "My wallet is like an onion. Opening it makes me cry.",
    author: "Unknown",
    tags: ["money", "relatable"],
  },
  { id: "3", text: "I'm on a seafood diet. I see food and I eat it.", author: "Anonymous", tags: ["food", "funny"] },
  {
    id: "4",
    text: "I don't need anger management. You need to stop making me mad.",
    author: "Unknown",
    tags: ["savage"],
  },
  {
    id: "5",
    text: "Common sense is like deodorant. People who need it most never use it.",
    author: "Anonymous",
    tags: ["savage", "truth"],
  },
  {
    id: "6",
    text: "My bed is a magical place where I suddenly remember everything I forgot to do.",
    author: "Unknown",
    tags: ["relatable", "funny"],
  },
  { id: "7", text: "I'm not lazy. I'm just on energy-saving mode.", author: "Anonymous", tags: ["lazy", "funny"] },
  {
    id: "8",
    text: "Silence is golden. Unless you have kids. Then silence is suspicious.",
    author: "Unknown",
    tags: ["parenting", "truth"],
  },
  {
    id: "9",
    text: "I followed my heart and it led me to the fridge.",
    author: "Anonymous",
    tags: ["food", "relatable"],
  },
  { id: "10", text: "I'm not short. I'm concentrated awesome.", author: "Unknown", tags: ["savage", "funny"] },
  {
    id: "11",
    text: "Some days I amaze myself. Other days I look for my phone while holding it.",
    author: "Anonymous",
    tags: ["relatable", "funny"],
  },
  { id: "12", text: "I'm not bossy. I just know what you should be doing.", author: "Unknown", tags: ["savage"] },
];

/**
 * Parse CSV text into Quote objects
 * Handles validation, deduplication, and missing optional fields
 */
function parseCSV(csvText: string): Quote[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  // Parse header row
  const headers = lines[0].split(",").map((h) =>
    h
      .trim()
      .toLowerCase()
      .replace(/^["']|["']$/g, ""),
  );

  // Find required column indices
  const idIndex = headers.indexOf("id");
  const textIndex = headers.indexOf("text");
  const authorIndex = headers.indexOf("author");
  const tagsIndex = headers.indexOf("tags");

  // Validate required columns exist
  if (idIndex === -1 || textIndex === -1) {
    console.error("CSV missing required columns: id and text");
    return [];
  }

  const quotes: Quote[] = [];
  const seenIds = new Set<string>();

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty rows

    // Simple CSV parsing (handles basic cases)
    const values = parseCSVLine(line);

    const id = values[idIndex]?.trim();
    const text = values[textIndex]?.trim();

    // Skip rows with missing required fields
    if (!id || !text) continue;

    // Skip duplicates
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    const quote: Quote = { id, text };

    // Add optional fields
    if (authorIndex !== -1 && values[authorIndex]?.trim()) {
      quote.author = values[authorIndex].trim();
    }

    if (tagsIndex !== -1 && values[tagsIndex]?.trim()) {
      quote.tags = values[tagsIndex]
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }

    quotes.push(quote);
  }

  return quotes;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.replace(/^["']|["']$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.replace(/^["']|["']$/g, ""));
  return result;
}

/**
 * Get cached quotes from localStorage
 */
function getCachedQuotes(): Quote[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn("Failed to read cached quotes:", e);
  }
  return null;
}

/**
 * Save quotes to cache
 */
function cacheQuotes(quotes: Quote[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(quotes));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    console.warn("Failed to cache quotes:", e);
  }
}

/**
 * Fetch quotes from Google Sheet
 */
async function fetchFromGoogleSheet(): Promise<Quote[] | null> {
  if (!GOOGLE_SHEET_CSV_URL) {
    console.log("No Google Sheet URL configured, using sample quotes");
    return null;
  }

  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    const quotes = parseCSV(csvText);

    if (quotes.length > 0) {
      cacheQuotes(quotes);
      return quotes;
    }
  } catch (e) {
    console.warn("Failed to fetch quotes from Google Sheet:", e);
  }

  return null;
}

/**
 * Load quotes with offline support
 *
 * Strategy:
 * 1. Return cached quotes immediately if available
 * 2. Fetch fresh quotes in background
 * 3. If no cache, wait for fetch or use samples
 */
export async function loadQuotes(): Promise<Quote[]> {
  const cached = getCachedQuotes();

  // If no Google Sheet URL configured, use sample quotes
  if (!GOOGLE_SHEET_CSV_URL) {
    return SAMPLE_QUOTES;
  }

  // Try to fetch fresh quotes
  const freshQuotes = await fetchFromGoogleSheet();

  if (freshQuotes && freshQuotes.length > 0) {
    return freshQuotes;
  }

  // Fall back to cached quotes
  if (cached && cached.length > 0) {
    console.log("Using cached quotes (fetch failed or offline)");
    return cached;
  }

  // Last resort: sample quotes
  console.log("No quotes available, using samples");
  return SAMPLE_QUOTES;
}

/**
 * Shuffle quotes for random feed order
 */
export function shuffleQuotes(quotes: Quote[]): Quote[] {
  const shuffled = [...quotes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
