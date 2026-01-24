import { useEffect, useState, useCallback, useRef } from 'react';
import { Quote, loadQuotes, shuffleQuotes } from '@/lib/quotes';
import { isFavorite, toggleFavorite, cleanupFavorites } from '@/lib/favorites';
import { getHideNSFW } from '@/lib/settings';
import { QuoteCard } from '@/components/QuoteCard';
import { AdBanner, shouldShowAd } from '@/components/AdBanner';
import { Loader2 } from 'lucide-react';

// Refresh quotes every 5 minutes when app is active
const REFRESH_INTERVAL = 5 * 60 * 1000;

export default function Feed() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [visibleAdKey, setVisibleAdKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const lastScrollTime = useRef(0);
  const lastRefreshTime = useRef(0);

  // Function to load/refresh quotes
  const refreshQuotes = useCallback(async (isInitialLoad = false) => {
    try {
      const loadedQuotes = await loadQuotes();
      
      // Filter NSFW if setting is enabled
      const hideNSFW = getHideNSFW();
      const filteredQuotes = hideNSFW 
        ? loadedQuotes.filter(q => !q.tags?.some(tag => tag.toLowerCase() === 'nsfw'))
        : loadedQuotes;
      
      // Only shuffle on initial load, not on refresh (to avoid jarring UX)
      if (isInitialLoad) {
        const shuffled = shuffleQuotes(filteredQuotes);
        setQuotes(shuffled);
      } else {
        // Merge new quotes while preserving order for existing ones
        setQuotes(prevQuotes => {
          const existingIds = new Set(prevQuotes.map(q => q.id));
          const newQuotes = filteredQuotes.filter(q => !existingIds.has(q.id));
          if (newQuotes.length > 0) {
            // Add new quotes to the end
            return [...prevQuotes, ...shuffleQuotes(newQuotes)];
          }
          return prevQuotes;
        });
      }
      
      // Clean up favorites for quotes that no longer exist
      cleanupFavorites(new Set(loadedQuotes.map(q => q.id)));
      
      // Initialize/update favorites state
      const favIds = new Set<string>();
      loadedQuotes.forEach(q => {
        if (isFavorite(q.id)) favIds.add(q.id);
      });
      setFavorites(favIds);
      
      lastRefreshTime.current = Date.now();
    } catch (e) {
      console.error('Failed to load quotes:', e);
    }
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      await refreshQuotes(true);
      setLoading(false);
    }
    init();
  }, [refreshQuotes]);

  // Auto-refresh on visibility change (when app comes to foreground) and periodic refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastRefresh = Date.now() - lastRefreshTime.current;
        // Refresh if it's been more than 1 minute since last refresh
        if (timeSinceLastRefresh > 60000) {
          refreshQuotes(false);
        }
      }
    };

    // Set up visibility change listener (for when app comes back to foreground)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up periodic refresh
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshQuotes(false);
      }
    }, REFRESH_INTERVAL);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [refreshQuotes]);

  // Handle favorite toggle
  const handleToggleFavorite = useCallback((quoteId: string) => {
    const newState = toggleFavorite(quoteId);
    setFavorites(prev => {
      const next = new Set(prev);
      if (newState) {
        next.add(quoteId);
      } else {
        next.delete(quoteId);
      }
      return next;
    });
  }, []);

  // Handle share
  const handleShare = useCallback((quote: Quote) => {
    const text = quote.author 
      ? `"${quote.text}" — ${quote.author}`
      : `"${quote.text}"`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Out of Pocket',
        text: text,
      }).catch(() => {
        // User cancelled or share failed
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text).then(() => {
        // Could show a toast here
      });
    }
  }, []);

  // Handle scroll to detect current quote and cycle back to start
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isScrolling.current) return;
    
    const now = Date.now();
    if (now - lastScrollTime.current < 100) return;
    lastScrollTime.current = now;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0) {
      setCurrentIndex(newIndex);
    }

    // Check if we've reached near the end and cycle back
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (scrollTop >= maxScroll - 10 && quotes.length > 0) {
      // Scroll back to the beginning after a brief moment
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          setCurrentIndex(0);
        }
      }, 500);
    }
  }, [currentIndex, quotes.length]);

  // Build feed items (quotes + ads) with their indices for visibility tracking
  const feedItems = useCallback(() => {
    const items: { type: 'quote' | 'ad'; quote?: Quote; key: string; feedIndex: number }[] = [];
    let adCount = 0;
    let feedIndex = 0;
    
    quotes.forEach((quote, index) => {
      items.push({ type: 'quote', quote, key: `quote-${quote.id}`, feedIndex: feedIndex++ });
      
      // Insert ad after every 4th quote
      if (shouldShowAd(index)) {
        items.push({ type: 'ad', key: `ad-${adCount++}`, feedIndex: feedIndex++ });
      }
    });
    
    return items;
  }, [quotes]);

  // Update visible ad based on current scroll position
  useEffect(() => {
    const items = feedItems();
    const currentItem = items[currentIndex];
    if (currentItem?.type === 'ad') {
      setVisibleAdKey(currentItem.key);
    } else {
      setVisibleAdKey(null);
    }
  }, [currentIndex, feedItems]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <p className="text-xl text-muted-foreground">No quotes yet</p>
        <p className="mt-2 text-sm text-muted-foreground/70">
          Configure your Google Sheet URL to load quotes
        </p>
      </div>
    );
  }

  const items = feedItems();

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full w-full snap-y snap-mandatory overflow-y-auto"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {items.map((item) => (
        <div
          key={item.key}
          className="flex h-full w-full shrink-0 snap-start snap-always"
          style={{ height: '100%' }}
        >
          {item.type === 'quote' && item.quote ? (
            <QuoteCard
              quote={item.quote}
              isFavorite={favorites.has(item.quote.id)}
              onToggleFavorite={() => handleToggleFavorite(item.quote!.id)}
              onShare={() => handleShare(item.quote!)}
            />
          ) : (
            <AdBanner isVisible={visibleAdKey === item.key} />
          )}
        </div>
      ))}
    </div>
  );
}
