import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, MapPin, Users, AlertTriangle, LogOut, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const DashboardContent = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: 'SOS Alert',
      description: 'Emergency alert button',
      icon: AlertTriangle,
      link: '/sos',
      color: 'bg-destructive',
    },
    {
      title: 'Live Location',
      description: 'Share your location',
      icon: MapPin,
      link: '/location',
      color: 'bg-accent',
    },
    {
      title: 'Emergency Contacts',
      description: 'Manage your contacts',
      icon: Users,
      link: '/contacts',
      color: 'bg-secondary',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">SheShield</span>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">
            {user?.email}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              onClick={() => navigate(feature.link)}
            >
              <CardHeader>
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Open
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-gradient-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access emergency features quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="destructive"
              className="w-full text-lg py-6"
              onClick={() => navigate('/sos')}
            >
              <AlertTriangle className="w-6 h-6 mr-2" />
              EMERGENCY SOS
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Press in case of emergency to alert your contacts
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
};

export default Dashboard;
