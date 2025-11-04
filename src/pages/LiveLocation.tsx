import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, MapPin, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const LiveLocationContent = () => {
  const { user } = useAuth();
  const [tracking, setTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const saveLocation = async (latitude: number, longitude: number, accuracy: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('location_history')
        .insert({
          user_id: user.id,
          latitude,
          longitude,
          accuracy,
        });

      if (error) throw error;
      setLastUpdate(new Date());
    } catch (error: any) {
      console.error('Failed to save location:', error);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setTracking(true);
    toast.success('Location tracking started');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        saveLocation(latitude, longitude, accuracy);
      },
      (error) => {
        toast.error('Failed to get location: ' + error.message);
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
    toast.info('Location tracking stopped');
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
          <h1 className="text-4xl font-bold mb-2">Live Location Tracking</h1>
          <p className="text-muted-foreground">
            Share your real-time location with your emergency contacts
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Location Status</CardTitle>
            <CardDescription>
              {tracking ? 'Your location is being tracked' : 'Location tracking is off'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tracking ? 'bg-accent animate-pulse' : 'bg-muted'}`}>
                {tracking ? (
                  <Activity className="w-6 h-6 text-white" />
                ) : (
                  <MapPin className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-semibold">
                  {tracking ? 'Tracking Active' : 'Tracking Inactive'}
                </p>
                {lastUpdate && (
                  <p className="text-sm text-muted-foreground">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            {currentLocation && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Current Location:</p>
                <p className="text-sm text-muted-foreground">
                  Latitude: {currentLocation.lat.toFixed(6)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Longitude: {currentLocation.lng.toFixed(6)}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {!tracking ? (
                <Button onClick={startTracking} className="w-full">
                  <MapPin className="w-4 h-4 mr-2" />
                  Start Tracking
                </Button>
              ) : (
                <Button onClick={stopTracking} variant="destructive" className="w-full">
                  Stop Tracking
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium">Enable Tracking</p>
                <p className="text-sm text-muted-foreground">
                  Click "Start Tracking" to begin sharing your location
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium">Continuous Updates</p>
                <p className="text-sm text-muted-foreground">
                  Your location is updated automatically every few seconds
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium">Emergency Access</p>
                <p className="text-sm text-muted-foreground">
                  Your contacts can view your location during emergencies
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const LiveLocation = () => {
  return (
    <ProtectedRoute>
      <LiveLocationContent />
    </ProtectedRoute>
  );
};

export default LiveLocation;
