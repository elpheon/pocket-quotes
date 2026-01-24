import { useState } from 'react';
import { Quote } from '@/lib/quotes';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDoubleTap } from '@/hooks/useDoubleTap';
import { hapticMedium } from '@/lib/haptics';

interface QuoteCardProps {
  quote: Quote;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
}

export function QuoteCard({ quote, isFavorite, onToggleFavorite, onShare }: QuoteCardProps) {
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const handleDoubleTap = useDoubleTap({
    onDoubleTap: () => {
      if (!isFavorite) {
        onToggleFavorite();
      }
      // Trigger haptic feedback
      hapticMedium();
      // Show heart animation
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 600);
    },
  });

  return (
    <div 
      className="relative flex h-full w-full flex-col items-center justify-center px-8 py-16"
      onClick={handleDoubleTap}
    >
      {/* Double-tap heart animation */}
      {showHeartAnimation && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Heart 
            className="h-24 w-24 animate-ping fill-destructive text-destructive opacity-75" 
          />
        </div>
      )}

      {/* Quote text */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="mb-6 font-serif text-3xl font-medium leading-relaxed text-foreground sm:text-4xl md:text-5xl">
          "{quote.text}"
        </p>
        
        {/* Author */}
        {quote.author && (
          <p className="text-lg text-muted-foreground">
            — {quote.author}
          </p>
        )}
        
        {/* Tags */}
        {quote.tags && quote.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {quote.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary/50 px-3 py-1 text-xs text-secondary-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons - right side floating */}
      <div className="absolute bottom-24 right-6 flex flex-col gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={cn(
            "h-14 w-14 rounded-full bg-card/80 backdrop-blur-sm transition-all duration-200",
            isFavorite && "text-destructive"
          )}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={cn("h-7 w-7", isFavorite && "fill-current")}
          />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          className="h-14 w-14 rounded-full bg-card/80 backdrop-blur-sm"
          aria-label="Share quote"
        >
          <Share2 className="h-7 w-7" />
        </Button>
      </div>
    </div>
  );
}
