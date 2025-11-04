import Hero from "@/components/Hero";
import About from "@/components/About";
import Features from "@/components/Features";
import TechStack from "@/components/TechStack";
import Screenshots from "@/components/Screenshots";
import FutureScope from "@/components/FutureScope";
import Team from "@/components/Team";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen font-['Poppins',sans-serif]">
      <Hero />
      <About />
      <Features />
      <TechStack />
      <Screenshots />
      <FutureScope />
      <Team />
      <Footer />
    </div>
  );
};

export default Index;
