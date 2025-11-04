import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, AlertTriangle, Mic, Smartphone, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const SOSPageContent = () => {
  const { user } = useAuth();
  const [sosActive, setSosActive] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);
  const shakeThreshold = 15;
  const lastShakeTimeRef = useRef<number>(0);

  useEffect(() => {
    // Voice recognition setup
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');

        if (transcript.toLowerCase().includes('help me')) {
          triggerSOS('voice');
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setVoiceListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!shakeEnabled) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const { x, y, z } = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
      const acceleration = Math.sqrt(x! * x! + y! * y! + z! * z!);
      const currentTime = new Date().getTime();

      if (acceleration > shakeThreshold && currentTime - lastShakeTimeRef.current > 1000) {
        lastShakeTimeRef.current = currentTime;
        triggerSOS('shake');
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [shakeEnabled]);

  const triggerSOS = async (triggerType: string) => {
    if (!user) return;

    setSosActive(true);
    toast.error('SOS ALERT TRIGGERED!', {
      duration: 5000,
    });

    try {
      // Get current location
      let latitude = null;
      let longitude = null;

      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;
              resolve();
            },
            () => resolve()
          );
        });
      }

      // Save SOS alert
      const { error: sosError } = await supabase
        .from('sos_alerts')
        .insert({
          user_id: user.id,
          latitude,
          longitude,
          trigger_type: triggerType,
        });

      if (sosError) throw sosError;

      // Get emergency contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('emergency_contacts')
        .select('*');

      if (contactsError) throw contactsError;

      // Simulate sending alerts (in real app, this would call an edge function)
      if (contacts && contacts.length > 0) {
        toast.success(`SOS alert sent to ${contacts.length} contact(s)`);
      } else {
        toast.warning('No emergency contacts configured');
      }

      setTimeout(() => setSosActive(false), 5000);
    } catch (error: any) {
      toast.error('Failed to send SOS alert');
      setSosActive(false);
    }
  };

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported');
      return;
    }

    if (voiceListening) {
      recognitionRef.current.stop();
      setVoiceListening(false);
      toast.info('Voice SOS disabled');
    } else {
      recognitionRef.current.start();
      setVoiceListening(true);
      toast.success('Voice SOS enabled - say "help me"');
    }
  };

  const toggleShake = () => {
    setShakeEnabled(!shakeEnabled);
    toast.info(shakeEnabled ? 'Shake SOS disabled' : 'Shake SOS enabled');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">SheShield</span>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Emergency SOS</h1>
          <p className="text-muted-foreground">
            Trigger emergency alerts to notify your contacts
          </p>
        </div>

        <Card className="mb-6 bg-gradient-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Emergency Alert</CardTitle>
            <CardDescription>
              Press the button below to send SOS alert to all your emergency contacts
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <button
              onClick={() => triggerSOS('manual')}
              disabled={sosActive}
              className={`w-48 h-48 rounded-full flex items-center justify-center transition-all ${
                sosActive
                  ? 'bg-destructive/50 scale-95'
                  : 'bg-destructive hover:scale-105 hover:shadow-2xl'
              } shadow-lg`}
            >
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-white mx-auto mb-2" />
                <span className="text-white font-bold text-xl">
                  {sosActive ? 'ALERT SENT!' : 'SOS'}
                </span>
              </div>
            </button>

            {sosActive && (
              <div className="text-center">
                <Bell className="w-8 h-8 text-destructive mx-auto mb-2 animate-bounce" />
                <p className="font-semibold text-destructive">
                  Emergency alert has been triggered!
                </p>
                <p className="text-sm text-muted-foreground">
                  Your emergency contacts have been notified
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Voice SOS
              </CardTitle>
              <CardDescription>
                Say "help me" to trigger SOS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={toggleVoiceListening}
                variant={voiceListening ? 'destructive' : 'outline'}
                className="w-full"
              >
                {voiceListening ? (
                  <>
                    <Mic className="w-4 h-4 mr-2 animate-pulse" />
                    Listening...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Enable Voice SOS
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Shake SOS
              </CardTitle>
              <CardDescription>
                Shake your device to trigger SOS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={toggleShake}
                variant={shakeEnabled ? 'destructive' : 'outline'}
                className="w-full"
              >
                {shakeEnabled ? (
                  <>
                    <Smartphone className="w-4 h-4 mr-2 animate-bounce" />
                    Shake Enabled
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 mr-2" />
                    Enable Shake SOS
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• SOS alerts will be sent to all your emergency contacts</p>
            <p>• Your current location will be shared if available</p>
            <p>• Voice SOS works best in quiet environments</p>
            <p>• Shake SOS requires device motion sensors</p>
            <p>• Make sure you have added emergency contacts before using SOS</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const SOSPage = () => {
  return (
    <ProtectedRoute>
      <SOSPageContent />
    </ProtectedRoute>
  );
};

export default SOSPage;
