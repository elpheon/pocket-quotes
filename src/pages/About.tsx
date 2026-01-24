import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Shield, ExternalLink, Send, Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getHideNSFW, setHideNSFW } from '@/lib/settings';
import { submitQuote } from '@/lib/submitQuote';
import { toast } from '@/hooks/use-toast';

// ============================================================
// PRODUCTION: Replace these with your actual App Store URLs
// ============================================================
const STORE_URLS = {
  ios: 'https://apps.apple.com/app/id000000000', // Replace with your App Store ID
  android: 'https://play.google.com/store/apps/details?id=com.yourcompany.outofpocket', // Replace with your package name
};

export default function About() {
  const [hideNSFW, setHideNSFWState] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [authorText, setAuthorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setHideNSFWState(getHideNSFW());
  }, []);

  const handleToggleNSFW = (checked: boolean) => {
    setHideNSFWState(checked);
    setHideNSFW(checked);
  };

  const handleRateApp = () => {
    const platform = Capacitor.getPlatform();
    
    if (platform === 'ios') {
      window.open(STORE_URLS.ios, '_blank');
    } else if (platform === 'android') {
      window.open(STORE_URLS.android, '_blank');
    } else {
      // Web fallback - show both options
      alert('Rate us on the App Store or Google Play Store!');
    }
  };

  const handleSubmitQuote = async () => {
    if (!quoteText.trim() || !authorText.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in both the quote and author fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await submitQuote({
        quote: quoteText.trim(),
        author: authorText.trim(),
      });

      if (success) {
        toast({
          title: "Quote submitted!",
          description: "Thanks for your submission. We'll review it soon!",
        });
        setQuoteText('');
        setAuthorText('');
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background/80">
      <div className="flex flex-1 flex-col items-center px-8 py-8 text-center">
        {/* Logo/Title */}
        <div className="mb-6">
          <h1 className="mb-2 text-4xl font-bold text-foreground">
            Outta Pocket
          </h1>
          <p className="text-lg text-muted-foreground">
            Quotes that hit different
          </p>
        </div>

        {/* Description */}
        <div className="mb-8 max-w-sm">
          <p className="text-muted-foreground">
            Scroll through an endless feed of the funniest, most savage, and 
            wildly out of pocket quotes. Save your favorites and share them 
            with friends.
          </p>
        </div>

        {/* Quote Submission Form */}
        <div className="mb-6 w-full max-w-sm rounded-lg border border-border bg-card p-4">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Submit a Quote</h2>
          
          <div className="space-y-3">
            <div className="text-left">
              <Label htmlFor="quote-text" className="text-sm text-foreground">
                Quote
              </Label>
              <Textarea
                id="quote-text"
                placeholder="Enter your quote..."
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
            
            <div className="text-left">
              <Label htmlFor="author-text" className="text-sm text-foreground">
                Author <span className="text-muted-foreground">(if unknown, put "anonymous")</span>
              </Label>
              <Input
                id="author-text"
                placeholder="Who said it?"
                value={authorText}
                onChange={(e) => setAuthorText(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <Button
              onClick={handleSubmitQuote}
              disabled={isSubmitting || !quoteText.trim() || !authorText.trim()}
              className="w-full gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Quote
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Settings */}
        <div className="mb-6 w-full max-w-sm rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="hide-nsfw" className="text-sm text-foreground">
              Hide NSFW quotes
            </Label>
            <Switch
              id="hide-nsfw"
              checked={hideNSFW}
              onCheckedChange={handleToggleNSFW}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleRateApp}
            variant="secondary"
            className="gap-2"
          >
            <Star className="h-5 w-5" />
            Rate this app
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            asChild
          >
            <Link to="/privacy">
              <Shield className="h-4 w-4" />
              Privacy Policy
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-8 text-center">
        <p className="text-xs text-muted-foreground/60">
          Version 1.0.0
        </p>
      </div>
    </div>
  );
}
