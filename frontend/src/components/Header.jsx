import { useTheme } from '../context/ThemeContext';
import { useLicense } from '../context/LicenseContext';
import CreditMeter from './CreditMeter';
import LicenseBadge from './LicenseBadge';

export default function Header() {
  const { mode } = useTheme();
  const { hasLicense } = useLicense();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={mode === 'light' ? '/images/adsgenius_logo_dark.png' : '/images/adsgenius_logo_light.png'}
              alt="AdGenius AI"
              className="h-10 w-auto"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* AI Status */}
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>AI Ready</span>
            </div>

            {/* License Info */}
            {hasLicense && (
              <>
                {/* Credit Meter */}
                <div className="hidden lg:block">
                  <CreditMeter variant="compact" />
                </div>

                {/* License Badge */}
                <div className="hidden md:block">
                  <LicenseBadge variant="compact" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
