import { useEffect, useState, useCallback, useRef } from 'react';
import { Quote, loadQuotes, shuffleQuotes } from '@/lib/quotes';
import { isFavorite, toggleFavorite, cleanupFavorites } from '@/lib/favorites';
import { getHideNSFW } from '@/lib/settings';
import { QuoteCard } from '@/components/QuoteCard';
import { StickyBannerAd, checkAndShowInterstitial, prepareInterstitial } from '@/components/AdBanner';
import { Loader2 } from 'lucide-react';

const REFRESH_INTERVAL = 5 * 60 * 1000;

export default function Feed() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const lastRefreshTime = useRef(0);

  // Pre-load first interstitial
  useEffect(() => {
    prepareInterstitial();
  }, []);

  // Function to load/refresh quotes
  const refreshQuotes = useCallback(async (isInitialLoad = false) => {
    try {
      const loadedQuotes = await loadQuotes();
      const hideNSFW = getHideNSFW();
      const filteredQuotes = hideNSFW 
        ? loadedQuotes.filter(q => !q.tags?.some(tag => tag.toLowerCase() === 'nsfw'))
        : loadedQuotes;
      
      if (isInitialLoad) {
        setQuotes(shuffleQuotes(filteredQuotes));
      } else {
        setQuotes(prevQuotes => {
          const existingIds = new Set(prevQuotes.map(q => q.id));
          const newQuotes = filteredQuotes.filter(q => !existingIds.has(q.id));
          if (newQuotes.length > 0) {
            return [...prevQuotes, ...shuffleQuotes(newQuotes)];
          }
          return prevQuotes;
        });
      }
      
      cleanupFavorites(new Set(loadedQuotes.map(q => q.id)));
      const favIds = new Set<string>();
      loadedQuotes.forEach(q => { if (isFavorite(q.id)) favIds.add(q.id); });
      setFavorites(favIds);
      lastRefreshTime.current = Date.now();
    } catch (e) {
      console.error('Failed to load quotes:', e);
    }
  }, []);

  useEffect(() => {
    async function init() {
      await refreshQuotes(true);
      setLoading(false);
    }
    init();
  }, [refreshQuotes]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastRefreshTime.current > 60000) {
        refreshQuotes(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') refreshQuotes(false);
    }, REFRESH_INTERVAL);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [refreshQuotes]);

  const handleToggleFavorite = useCallback((quoteId: string) => {
    const newState = toggleFavorite(quoteId);
    setFavorites(prev => {
      const next = new Set(prev);
      newState ? next.add(quoteId) : next.delete(quoteId);
      return next;
    });
  }, []);

  const handleShare = useCallback((quote: Quote) => {
    const text = quote.author ? `"${quote.text}" — ${quote.author}` : `"${quote.text}"`;
    if (navigator.share) {
      navigator.share({ title: 'Out of Pocket', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {});
    }
  }, []);

  // Scroll end detection
  const handleScrollEnd = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);

    if (newIndex !== currentIndex && newIndex >= 0) {
      setCurrentIndex(newIndex);
      checkAndShowInterstitial();
    }

    // Cycle back when reaching the end
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (scrollTop >= maxScroll - 10 && quotes.length > 0) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          setCurrentIndex(0);
        }
      }, 800);
    }
  }, [currentIndex, quotes.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScrollEnd, 150);
    };
    if ('onscrollend' in window) {
      container.addEventListener('scrollend', handleScrollEnd);
      return () => container.removeEventListener('scrollend', handleScrollEnd);
    } else {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => { container.removeEventListener('scroll', handleScroll); clearTimeout(scrollTimeout); };
    }
  }, [handleScrollEnd]);

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

  return (
    <div className="flex h-full w-full flex-col">
      {/* Sticky banner ad at top */}
      <StickyBannerAd />
      
      {/* Scrollable quote feed */}
      <div 
        ref={containerRef}
        className="flex-1 snap-y snap-mandatory overflow-y-auto"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {quotes.map((quote) => (
          <div
            key={quote.id}
            className="flex w-full shrink-0 snap-start snap-always"
            style={{ height: '100%' }}
          >
            <QuoteCard
              quote={quote}
              isFavorite={favorites.has(quote.id)}
              onToggleFavorite={() => handleToggleFavorite(quote.id)}
              onShare={() => handleShare(quote)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
