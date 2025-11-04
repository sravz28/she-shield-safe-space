import { Shield, Users, TrendingUp } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            About the Project
          </h2>
          
          <div className="w-24 h-1 bg-gradient-feature mx-auto rounded-full"></div>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            SheShield is an innovative smart safety application designed to empower women with cutting-edge technology for their security and peace of mind. In today's world, women's safety has become a critical concern, and traditional safety measures are often insufficient. This project addresses the urgent need for a comprehensive, intelligent safety solution that leverages modern technology to provide real-time protection.
          </p>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            The application combines AI-powered distress detection, voice-activated emergency alerts, live location tracking, and smart danger zone awareness to create a robust safety network. By integrating these features into a single, user-friendly platform, SheShield solves the problem of delayed emergency response and provides women with immediate access to help when they need it most.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 pt-8">
            <div className="p-6 bg-gradient-card rounded-2xl border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Protection</h3>
              <p className="text-muted-foreground">AI-powered safety features that work instantly</p>
            </div>
            
            <div className="p-6 bg-gradient-card rounded-2xl border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Focused</h3>
              <p className="text-muted-foreground">Empowering women through technology</p>
            </div>
            
            <div className="p-6 bg-gradient-card rounded-2xl border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <TrendingUp className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Future Ready</h3>
              <p className="text-muted-foreground">Continuously evolving safety solutions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
