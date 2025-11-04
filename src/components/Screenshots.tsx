import { Card } from "@/components/ui/card";

const screenshots = [
  { title: "Login Page", description: "Secure authentication with multiple options" },
  { title: "Dashboard", description: "Intuitive interface with quick access to all features" },
  { title: "SOS Button", description: "One-tap emergency alert activation" },
  { title: "Live Tracking Map", description: "Real-time location sharing with contacts" },
  { title: "Emergency Contacts", description: "Easy management of trusted contacts" }
];

const Screenshots = () => {
  return (
    <section id="screenshots" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            App Screenshots
          </h2>
          <div className="w-24 h-1 bg-gradient-feature mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-muted-foreground">
            A glimpse into SheShield's user-friendly interface
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {screenshots.map((screenshot, index) => (
            <Card 
              key={index}
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-[9/16] bg-gradient-hero flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-feature opacity-20 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative z-10 text-center p-6 text-white">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <span className="text-3xl font-bold">{index + 1}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{screenshot.title}</h3>
                </div>
              </div>
              <div className="p-4 bg-card">
                <p className="text-sm text-muted-foreground text-center">{screenshot.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Screenshots;
