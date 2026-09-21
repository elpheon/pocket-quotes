import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

// PRODUCTION: Update this email to your real support address before submitting to app stores
const SUPPORT_EMAIL = 'support@outofpocketapp.com';

export default function Support() {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/about">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Support</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
          
          <h2 className="text-xl font-semibold text-foreground">Need help?</h2>
          
          <p className="text-sm text-muted-foreground">
            If you have questions, feedback, or need assistance with Outta Pocket, 
            please reach out to us via email.
          </p>

          <Button variant="outline" size="lg" className="gap-2" asChild>
            <a href={`mailto:${SUPPORT_EMAIL}`}>
              <Mail className="h-4 w-4" />
              {SUPPORT_EMAIL}
            </a>
          </Button>

          <p className="text-xs text-muted-foreground/60">
            We typically respond within 1-2 business days.
          </p>
        </div>
      </div>
    </div>
  );
}
