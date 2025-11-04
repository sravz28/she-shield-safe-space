import { Code2, Database, Map, Mic2, Video, Cpu } from "lucide-react";

const technologies = [
  { icon: Code2, name: "Android", description: "Java/Kotlin or Flutter" },
  { icon: Database, name: "Firebase", description: "Real-time Database & Auth" },
  { icon: Map, name: "Google Maps API", description: "Location Services" },
  { icon: Mic2, name: "Speech Recognition", description: "Voice Commands" },
  { icon: Video, name: "MediaRecorder API", description: "Audio/Video Recording" },
  { icon: Cpu, name: "ML Kit / TensorFlow Lite", description: "AI & Machine Learning" }
];

const TechStack = () => {
  return (
    <section id="tech-stack" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Technology Stack
          </h2>
          <div className="w-24 h-1 bg-gradient-feature mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-muted-foreground">
            Built with modern, reliable, and scalable technologies
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {technologies.map((tech, index) => (
            <div 
              key={index}
              className="group p-8 bg-gradient-card rounded-2xl border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-feature rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <tech.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{tech.name}</h3>
                  <p className="text-sm text-muted-foreground">{tech.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
