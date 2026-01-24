import { useEffect, useState, useCallback } from 'react';
import { Quote, loadQuotes } from '@/lib/quotes';
import { getFavoriteIds, removeFavorite, cleanupFavorites } from '@/lib/favorites';
import { Heart, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Saved() {
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  // Load saved quotes on mount
  useEffect(() => {
    async function init() {
      try {
        const allQuotes = await loadQuotes();
        const favoriteIds = getFavoriteIds();
        
        // Clean up any orphaned favorites
        cleanupFavorites(new Set(allQuotes.map(q => q.id)));
        
        // Filter to only favorited quotes
        const saved = allQuotes.filter(q => favoriteIds.has(q.id));
        setSavedQuotes(saved);
      } catch (e) {
        console.error('Failed to load saved quotes:', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Handle remove from favorites
  const handleRemove = useCallback((quoteId: string) => {
    removeFavorite(quoteId);
    setSavedQuotes(prev => prev.filter(q => q.id !== quoteId));
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
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (savedQuotes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <Heart className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <p className="text-xl font-medium text-foreground">No saved quotes yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Tap the heart on quotes you love to save them here
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 py-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Saved Quotes</h1>
        
        <div className="space-y-4">
          {savedQuotes.map((quote) => (
            <div
              key={quote.id}
              className="rounded-lg bg-card p-5 shadow-sm"
            >
              <p className="mb-3 font-serif text-lg leading-relaxed text-card-foreground">
                "{quote.text}"
              </p>
              
              {quote.author && (
                <p className="mb-3 text-sm text-muted-foreground">
                  — {quote.author}
                </p>
              )}
              
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(quote)}
                  className="h-9 px-3"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(quote.id)}
                  className="h-9 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
