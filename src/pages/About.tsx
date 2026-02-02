import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Shield, ExternalLink, Send, Loader2, Sun, Moon, WifiOff, Grid3X3, Bell, BellOff } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getHideNSFW, setHideNSFW, getTheme, setTheme as saveTheme, getShowBackground, setShowBackground as saveShowBackground, getNotificationEnabled, setNotificationEnabled, getNotificationTime, setNotificationTime } from '@/lib/settings';
import { submitQuote } from '@/lib/submitQuote';
import { toast } from '@/hooks/use-toast';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { isOnline, onNetworkChange } from '@/lib/network';
import { scheduleDailyNotification, cancelDailyNotification } from '@/lib/notifications';

const QUOTE_MAX_LENGTH = 300;
const AUTHOR_MAX_LENGTH = 40;

// ============================================================
// PRODUCTION: Replace these with your actual App Store URLs
// ============================================================
const STORE_URLS = {
  ios: 'https://apps.apple.com/app/id000000000',
  android: 'https://play.google.com/store/apps/details?id=com.yourcompany.outofpocket',
};

export default function About() {
  const [hideNSFW, setHideNSFWState] = useState(true);
  const [quoteText, setQuoteText] = useState('');
  const [authorText, setAuthorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showBackground, setShowBackgroundState] = useState(true);
  const [networkOnline, setNetworkOnline] = useState(isOnline());
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [notificationHour, setNotificationHour] = useState(10);
  const [notificationMinute, setNotificationMinute] = useState(0);

  useEffect(() => {
    setHideNSFWState(getHideNSFW());
    setShowBackgroundState(getShowBackground());
    setNotificationsEnabledState(getNotificationEnabled());
    const savedTime = getNotificationTime();
    setNotificationHour(savedTime.hour);
    setNotificationMinute(savedTime.minute);
    
    const savedTheme = getTheme();
    const isDark = savedTheme === 'dark' || 
      (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);

    // Subscribe to network changes
    const cleanup = onNetworkChange(setNetworkOnline);
    return cleanup;
  }, []);

  const handleToggleNSFW = (checked: boolean) => {
    setHideNSFWState(checked);
    setHideNSFW(checked);
    hapticLight();
  };

  const handleToggleTheme = (checked: boolean) => {
    setIsDarkMode(checked);
    const newTheme = checked ? 'dark' : 'light';
    saveTheme(newTheme);
    hapticLight();
    
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleToggleBackground = (checked: boolean) => {
    setShowBackgroundState(checked);
    saveShowBackground(checked);
    hapticLight();
    // Dispatch custom event for App.tsx to listen to
    window.dispatchEvent(new CustomEvent('backgroundSettingChanged', { detail: checked }));
  };

  const handleToggleNotifications = async (checked: boolean) => {
    setNotificationsEnabledState(checked);
    setNotificationEnabled(checked);
    hapticLight();
    
    if (checked) {
      const success = await scheduleDailyNotification(notificationHour, notificationMinute);
      if (success) {
        toast({
          title: "Notifications enabled",
          description: `You'll be reminded daily at ${formatTime(notificationHour, notificationMinute)}`,
        });
      }
    } else {
      await cancelDailyNotification();
      toast({
        title: "Notifications disabled",
        description: "You won't receive daily quote reminders",
      });
    }
  };

  const handleTimeChange = async (hour: number, minute: number) => {
    setNotificationHour(hour);
    setNotificationMinute(minute);
    setNotificationTime(hour, minute);
    hapticLight();
    
    if (notificationsEnabled) {
      await scheduleDailyNotification(hour, minute);
      toast({
        title: "Notification time updated",
        description: `You'll be reminded daily at ${formatTime(hour, minute)}`,
      });
    }
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const handleRateApp = () => {
    const platform = Capacitor.getPlatform();
    
    if (platform === 'ios') {
      window.open(STORE_URLS.ios, '_blank');
    } else if (platform === 'android') {
      window.open(STORE_URLS.android, '_blank');
    } else {
      alert('Rate us on the App Store or Google Play Store!');
    }
  };

  const handleQuoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= QUOTE_MAX_LENGTH) {
      setQuoteText(value);
    }
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= AUTHOR_MAX_LENGTH) {
      setAuthorText(value);
    }
  };

  const handleSubmitQuote = async () => {
    // Check network connectivity first
    if (!isOnline()) {
      toast({
        title: "No internet connection",
        description: "You need Wi-Fi or cellular service to submit quotes.",
        variant: "destructive",
      });
      return;
    }

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
        hapticSuccess();
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

  const quoteAtLimit = quoteText.length >= QUOTE_MAX_LENGTH;
  const authorAtLimit = authorText.length >= AUTHOR_MAX_LENGTH;

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
          
          {/* Offline Warning */}
          {!networkOnline && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-left">
              <WifiOff className="h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">
                You need Wi-Fi or cellular service to submit quotes.
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <div className="text-left">
              <Label htmlFor="quote-text" className="text-sm text-foreground">
                Quote
              </Label>
              {quoteAtLimit && (
                <p className="text-xs text-destructive mt-1">
                  Character limit reached ({QUOTE_MAX_LENGTH} characters max)
                </p>
              )}
              <Textarea
                id="quote-text"
                placeholder="Enter your quote..."
                value={quoteText}
                onChange={handleQuoteChange}
                className="mt-1 resize-none"
                rows={3}
                maxLength={QUOTE_MAX_LENGTH}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {quoteText.length}/{QUOTE_MAX_LENGTH}
              </p>
            </div>
            
            <div className="text-left">
              <Label htmlFor="author-text" className="text-sm text-foreground">
                Author <span className="text-muted-foreground">(if unknown, put "anonymous")</span>
              </Label>
              {authorAtLimit && (
                <p className="text-xs text-destructive mt-1">
                  Character limit reached ({AUTHOR_MAX_LENGTH} characters max)
                </p>
              )}
              <Input
                id="author-text"
                placeholder="Who said it?"
                value={authorText}
                onChange={handleAuthorChange}
                className="mt-1"
                maxLength={AUTHOR_MAX_LENGTH}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {authorText.length}/{AUTHOR_MAX_LENGTH}
              </p>
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
        <div className="mb-6 w-full max-w-sm rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <Label htmlFor="dark-mode" className="text-sm text-foreground">
                Dark mode
              </Label>
            </div>
            <Switch
              id="dark-mode"
              checked={isDarkMode}
              onCheckedChange={handleToggleTheme}
            />
          </div>
          
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              <Label htmlFor="show-background" className="text-sm text-foreground">
                Show background pattern
              </Label>
            </div>
            <Switch
              id="show-background"
              checked={showBackground}
              onCheckedChange={handleToggleBackground}
            />
          </div>
        </div>

        {/* Notification Settings */}
        <div className="mb-6 w-full max-w-sm rounded-lg border border-border bg-card p-4 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            {notificationsEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            Daily Quote Reminder
          </h2>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications-enabled" className="text-sm text-foreground">
              Enable daily reminder
            </Label>
            <Switch
              id="notifications-enabled"
              checked={notificationsEnabled}
              onCheckedChange={handleToggleNotifications}
            />
          </div>
          
          {notificationsEnabled && (
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Reminder time</Label>
              <div className="flex gap-2">
                <Select 
                  value={notificationHour.toString()} 
                  onValueChange={(val) => handleTimeChange(parseInt(val), notificationMinute)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const period = i >= 12 ? 'PM' : 'AM';
                      const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i;
                      return (
                        <SelectItem key={i} value={i.toString()}>
                          {displayHour} {period}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Select 
                  value={notificationMinute.toString()} 
                  onValueChange={(val) => handleTimeChange(notificationHour, parseInt(val))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">:00</SelectItem>
                    <SelectItem value="15">:15</SelectItem>
                    <SelectItem value="30">:30</SelectItem>
                    <SelectItem value="45">:45</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                You'll get a notification to check your Quote of the Day
              </p>
            </div>
          )}
        </div>

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
