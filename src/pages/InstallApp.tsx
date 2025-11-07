import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Download, Smartphone, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InstallApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold">Install SheShield</h1>
          <p className="text-muted-foreground">
            Get instant access to safety features right from your home screen
          </p>
        </div>

        {isInstalled ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">App Installed!</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You can now access SheShield from your home screen
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Home
            </Button>
          </div>
        ) : isInstallable ? (
          <div className="space-y-4">
            <Button onClick={handleInstall} size="lg" className="w-full">
              <Download className="w-5 h-5 mr-2" />
              Install App
            </Button>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Works Offline</p>
                  <p>Access safety features even without internet</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Fast & Secure</p>
                  <p>Instant access from your home screen</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="font-medium">How to Install:</p>
              <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Tap the browser menu (⋮ or ⋯)</li>
                <li>Select "Add to Home Screen" or "Install App"</li>
                <li>Tap "Add" or "Install"</li>
              </ol>
            </div>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Continue in Browser
            </Button>
          </div>
        )}

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            No app store required • Works on all devices
          </p>
        </div>
      </Card>
    </div>
  );
};

export default InstallApp;
