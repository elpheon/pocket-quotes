import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getHideNSFW, setHideNSFW } from '@/lib/settings';

export default function About() {
  const [hideNSFW, setHideNSFWState] = useState(false);

  useEffect(() => {
    setHideNSFWState(getHideNSFW());
  }, []);

  const handleToggleNSFW = (checked: boolean) => {
    setHideNSFWState(checked);
    setHideNSFW(checked);
  };

  const handleRateApp = () => {
    // Replace with your actual app store URLs
    alert('Rate app functionality will work in the native app build');
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-foreground">
            Out of Pocket
          </h1>
          <p className="text-lg text-muted-foreground">
            Quotes that hit different
          </p>
        </div>

        {/* Description */}
        <div className="mb-10 max-w-sm">
          <p className="text-muted-foreground">
            Scroll through an endless feed of the funniest, most savage, and 
            wildly out of pocket quotes. Save your favorites and share them 
            with friends.
          </p>
        </div>

        {/* Settings */}
        <div className="mb-8 w-full max-w-sm rounded-lg border border-border bg-card p-4">
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

        {/* Rate button */}
        <Button
          onClick={handleRateApp}
          variant="secondary"
          className="gap-2"
        >
          <Star className="h-5 w-5" />
          Rate this app
        </Button>
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
