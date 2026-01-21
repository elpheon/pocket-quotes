import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Privacy() {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/about">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Privacy Policy</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-2xl space-y-6 text-sm text-muted-foreground">
          <p className="text-xs text-muted-foreground/60">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">Overview</h2>
            <p>
              Out of Pocket ("we", "our", or "the app") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your information 
              when you use our mobile application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">Data We Collect</h2>
            <p>
              <strong className="text-foreground">Local Storage Only:</strong> All data is stored 
              locally on your device. We do not collect, transmit, or store any personal information 
              on external servers.
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Saved/favorited quotes (stored locally on your device)</li>
              <li>Quote of the Day selection (stored locally on your device)</li>
              <li>App preferences and settings (stored locally on your device)</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">Advertisements</h2>
            <p>
              This app displays advertisements through Google AdMob. Google may collect and use 
              data for personalized advertising. This may include:
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Device identifiers</li>
              <li>IP address</li>
              <li>General location data</li>
              <li>Ad interaction data</li>
            </ul>
            <p>
              For more information about how Google uses data, visit:{' '}
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Google Privacy Policy
              </a>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">Notifications</h2>
            <p>
              If you enable notifications, the app schedules local notifications on your device. 
              No notification data is sent to external servers. You can disable notifications 
              at any time through your device settings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">Third-Party Services</h2>
            <p>This app uses the following third-party services:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <strong className="text-foreground">Google AdMob:</strong> For displaying 
                advertisements
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">Children's Privacy</h2>
            <p>
              This app is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be reflected 
              in the app with an updated "Last updated" date.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:{' '}
              <a 
                href="mailto:support@outofpocketapp.com" 
                className="text-primary underline"
              >
                support@outofpocketapp.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
