
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden px-6 md:px-8 lg:px-12 py-32">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 top-1/4 w-72 h-72 bg-ev-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute left-1/4 bottom-1/4 w-96 h-96 bg-ev-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div 
          className={`space-y-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm font-medium animate-fade-in">
              <Zap className="h-4 w-4 text-ev-green-400" />
              <span className="text-white">Revolutionizing EV charging</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Charge Your EV <span className="text-gradient-green">Smarter</span> <br />
              Drive <span className="text-gradient-blue">Further</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-xl">
              Discover the most convenient charging stations for your electric vehicle with our advanced station locator and smart charging network.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-ev-green-500 hover:bg-ev-green-600 text-white transition-all duration-300 group"
            >
              <Link to="/stations">
                Find Charging Stations
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-white/10 text-white hover:bg-white/5 hover:text-ev-green-400 transition-all duration-300"
              asChild
            >
              <Link to="/signup">
                Sign Up Free
              </Link>
            </Button>
          </div>

          <div className="flex items-center space-x-6 pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-ev-dark-200 bg-ev-dark-100 flex items-center justify-center overflow-hidden"
                >
                  <div className={`w-full h-full bg-ev-green-${i * 100} opacity-70`}></div>
                </div>
              ))}
            </div>
            <div className="text-sm text-white/70">
              <span className="font-semibold text-white">10,000+</span> EV drivers trust us
            </div>
          </div>
        </div>

        <div 
          className={`relative transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}
        >
          <div className="absolute inset-0 w-full h-full rounded-full bg-ev-green-500/5 blur-3xl"></div>
          <div className="relative w-full aspect-square max-w-md mx-auto">
            {/* Main Electric Car 3D Model */}
            <div className="absolute inset-0 neo-card rounded-3xl overflow-hidden animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-ev-dark-100 to-ev-dark-300 opacity-60"></div>
              <div className="h-full w-full flex items-center justify-center p-6">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-ev-dark-200 border border-white/5 flex items-center justify-center">
                  <div className="w-full h-full bg-ev-dark-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute -bottom-8 -right-8 w-56 h-56 bg-ev-green-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute -top-8 -left-8 w-56 h-56 bg-ev-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="relative p-6">
                      {/* Enhanced modern electric car icon/illustration */}
                      <svg viewBox="0 0 300 200" className="w-full h-auto">
                        {/* Car body */}
                        <path fill="#2A2A2A" d="M50,120 C60,100 120,80 180,80 C250,80 270,110 280,120 L280,160 C280,170 270,180 260,180 L70,180 C60,180 50,170 50,160 Z" />
                        {/* Car top */}
                        <path fill="#333333" d="M100,80 C120,50 170,50 190,80 Z" />
                        {/* Windows */}
                        <path fill="#88CCFF" d="M110,80 C125,60 165,60 180,80 L180,110 L110,110 Z" />
                        {/* Headlights */}
                        <ellipse fill="#FFFFFF" cx="70" cy="120" rx="10" ry="8" />
                        <ellipse fill="#FFFFFF" cx="260" cy="120" rx="10" ry="8" />
                        {/* Wheels */}
                        <circle fill="#111111" cx="90" cy="160" r="25" />
                        <circle fill="#333333" cx="90" cy="160" r="15" />
                        <circle fill="#111111" cx="230" cy="160" r="25" />
                        <circle fill="#333333" cx="230" cy="160" r="15" />
                        {/* Charge port with animation */}
                        <rect fill="#444444" x="190" y="110" width="20" height="10" rx="2" />
                        <circle fill="#22C55E" cx="200" cy="115" r="4" className="animate-pulse-slow" />
                        {/* Charge cable */}
                        <path fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 2" d="M200,115 Q230,115 240,90 Q250,70 280,70" className="animate-pulse-slow" />
                        <circle fill="#22C55E" cx="280" cy="70" r="8" className="animate-pulse-slow" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -top-6 -right-6 glass-card w-32 h-32 rounded-2xl rotate-12 animate-float" style={{ animationDelay: '1s' }}>
              <div className="h-full w-full flex items-center justify-center">
                <Zap className="h-12 w-12 text-ev-green-500" />
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 glass-card w-28 h-28 rounded-2xl -rotate-12 animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-ev-blue-400">300+</div>
                  <div className="text-xs text-white/60">Stations</div>
                </div>
              </div>
            </div>

            {/* Interactive battery status */}
            <div className="absolute -bottom-6 right-10 glass-card py-2 px-4 rounded-full animate-float" style={{ animationDelay: '2s' }}>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-4 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-ev-green-300 to-ev-green-500 w-3/4 animate-pulse-slow"></div>
                </div>
                <div className="text-ev-green-400 text-xs font-medium">75%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce opacity-70">
        <span className="text-white/60 text-sm mb-2">Scroll to explore</span>
        <ChevronRight className="h-5 w-5 text-white/60 rotate-90" />
      </div>
    </section>
  );
};

export default Hero;
