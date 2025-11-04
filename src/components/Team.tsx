import { GraduationCap, User, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Team = () => {
  return (
    <section id="team" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Project Team
          </h2>
          <div className="w-24 h-1 bg-gradient-feature mx-auto rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border animate-fade-in">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-feature rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Student Name</h3>
                <p className="text-muted-foreground">Developer</p>
                <p className="text-sm text-muted-foreground mt-2">Roll No: [Your Roll Number]</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border animate-fade-in" style={{ animationDelay: "100ms" }}>
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-hero rounded-full flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">College Name</h3>
                <p className="text-muted-foreground">Institution</p>
                <p className="text-sm text-muted-foreground mt-2">Computer Science</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border animate-fade-in" style={{ animationDelay: "200ms" }}>
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-secondary rounded-full flex items-center justify-center">
                <UserCheck className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Guided By</h3>
                <p className="text-muted-foreground">Faculty Mentor</p>
                <p className="text-sm text-muted-foreground mt-2">[Faculty Name]</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Team;
