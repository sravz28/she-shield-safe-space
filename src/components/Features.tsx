import { Mic, MapPin, Video, AlertTriangle, Battery, Phone, Smartphone, Zap, Brain, MapPinned, Cloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const coreFeatures = [
  {
    icon: Mic,
    title: "Voice-Activated SOS",
    description: "Trigger emergency alerts using voice commands without touching your phone"
  },
  {
    icon: MapPin,
    title: "Live Location Tracking",
    description: "Real-time GPS tracking shared with emergency contacts automatically"
  },
  {
    icon: Video,
    title: "Auto Audio & Video Recording",
    description: "Automatic recording starts when danger is detected for evidence"
  },
  {
    icon: AlertTriangle,
    title: "Danger Zone Alerts",
    description: "Get notified when entering high-risk areas based on crime data"
  },
  {
    icon: Battery,
    title: "Battery Backup Alerts",
    description: "Notify contacts when battery is low with last known location"
  },
  {
    icon: Phone,
    title: "Emergency Contacts",
    description: "Quick-dial emergency contacts with one-tap calling feature"
  },
  {
    icon: Smartphone,
    title: "Shake-to-SOS",
    description: "Shake your phone rapidly to trigger silent emergency alert"
  },
  {
    icon: Zap,
    title: "Flashlight + Alarm Mode",
    description: "Instant flashlight and loud alarm to attract attention"
  }
];

const uniqueFeatures = [
  {
    icon: Brain,
    title: "AI-Based Distress Detection",
    description: "Machine learning algorithms detect distress patterns in voice and behavior automatically"
  },
  {
    icon: MapPinned,
    title: "Crime-Zone Awareness",
    description: "Real-time crime data integration to alert users about dangerous areas proactively"
  },
  {
    icon: Cloud,
    title: "Cloud Backup of Evidence",
    description: "Secure cloud storage of all recordings and data for legal purposes and recovery"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Core Features
          </h2>
          <div className="w-24 h-1 bg-gradient-feature mx-auto rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {coreFeatures.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-card border-border animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-feature rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Smart & Unique Features
          </h2>
          <div className="w-24 h-1 bg-gradient-hero mx-auto rounded-full"></div>
          <p className="text-lg text-muted-foreground mt-4">
            Advanced AI-powered capabilities that set SheShield apart
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {uniqueFeatures.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 bg-gradient-card border-border animate-scale-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-hero rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
