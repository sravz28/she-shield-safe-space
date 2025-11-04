import { Shield, Github, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-hero text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">SheShield</h3>
              <p className="text-sm text-white/80">Smart Women Safety Application</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <a 
              href="#" 
              className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Github"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/70">
          <p>&copy; {new Date().getFullYear()} SheShield – Smart Women Safety Application. All rights reserved.</p>
          <p className="mt-2">Computer Science Project</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
