import { Watch, Globe, Shield, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const futureFeatures = [
  {
    icon: Watch,
    title: "Wearable Band Pairing",
    description: "Integrate with smartwatches and fitness bands for discrete SOS triggers and continuous monitoring"
  },
  {
    icon: Globe,
    title: "Multi-language Voice Detection",
    description: "Expand voice command support to multiple languages for global accessibility"
  },
  {
    icon: Shield,
    title: "Police Network Integration",
    description: "Direct integration with local police networks for faster emergency response times"
  },
  {
    icon: Sparkles,
    title: "Full AI Mode",
    description: "Advanced AI that learns user patterns and predicts potential danger situations proactively"
  }
];

const FutureScope = () => {
  return (
    <section id="future-scope" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Future Scope
          </h2>
          <div className="w-24 h-1 bg-gradient-feature mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our vision for expanding SheShield's capabilities and reach
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {futureFeatures.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8 flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-feature rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FutureScope;
