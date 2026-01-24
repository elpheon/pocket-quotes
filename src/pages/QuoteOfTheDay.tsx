import { useState, useEffect, useRef } from 'react';
import { Quote } from '@/lib/quotes';
import { getQuoteOfTheDay } from '@/lib/quoteOfTheDay';
import { Quote as QuoteIcon } from 'lucide-react';

export default function QuoteOfTheDay() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Only load once per component mount
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadQuoteOfTheDay();
  }, []);

  const loadQuoteOfTheDay = async () => {
    setIsLoading(true);
    const qotd = await getQuoteOfTheDay();
    setQuote(qotd);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground text-center">
          No quote available. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with safe area for phone notch/bevel */}
      <header className="border-b border-border px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <h1 className="text-lg font-bold text-foreground">Quote of the Day</h1>
      </header>

      {/* Quote Display */}
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="max-w-md text-center">
          {/* Decorative quote icon */}
          <QuoteIcon className="mx-auto mb-6 h-12 w-12 text-primary/40" />
          
          {/* Quote text */}
          <blockquote className="mb-6 text-2xl font-medium leading-relaxed text-foreground">
            "{quote.text}"
          </blockquote>
          
          {/* Author */}
          {quote.author && (
            <p className="text-lg text-muted-foreground">
              — {quote.author}
            </p>
          )}
          
          {/* Tags */}
          {quote.tags && quote.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {quote.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Today's date */}
      <div className="border-t border-border px-4 py-3 text-center">
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
}
