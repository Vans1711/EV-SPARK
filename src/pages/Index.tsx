
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Battery, Bolt, Clock, CreditCard, MapPin, Shield, Smartphone, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';
import Footer from '@/components/Footer';
import { useSparkCoins } from '@/context/SparkCoinsContext';

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(() => {
    return localStorage.getItem('dailyRewardClaimed') === new Date().toDateString();
  });
  const featuresSectionRef = useRef<HTMLDivElement>(null);
  const { addCoins } = useSparkCoins();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (featuresSectionRef.current) {
      observer.observe(featuresSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const claimDailyReward = () => {
    addCoins(50, 'Daily website visit reward');
    setRewardClaimed(true);
    localStorage.setItem('dailyRewardClaimed', new Date().toDateString());
  };

  useEffect(() => {
    // Check if the user hasn't claimed their daily reward yet
    if (!rewardClaimed) {
      // Wait a bit before showing the reward popup
      const timer = setTimeout(() => {
        const shouldShowReward = !localStorage.getItem('dailyRewardClaimed') || 
          localStorage.getItem('dailyRewardClaimed') !== new Date().toDateString();
        
        if (shouldShowReward) {
          claimDailyReward();
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [rewardClaimed]);

  const features = [
    {
      icon: MapPin,
      title: "Smart Station Locator",
      description: "Find the nearest charging stations with real-time availability and compatibility with your EV."
    },
    {
      icon: Bolt,
      title: "Fast Charging Network",
      description: "Access our premium network of fast chargers, reducing your charging time by up to 70%."
    },
    {
      icon: CreditCard,
      title: "Seamless Payments",
      description: "Pay effortlessly with multiple payment options including UPI, cards, and digital wallets."
    },
    {
      icon: Battery,
      title: "Smart Charging",
      description: "Optimize your charging schedule based on electricity rates and battery health."
    },
    {
      icon: Smartphone,
      title: "Mobile App Control",
      description: "Monitor and control charging sessions remotely with our feature-rich mobile app."
    },
    {
      icon: Shield,
      title: "Emergency Support",
      description: "24/7 roadside assistance available for all EV Spark members when you need help."
    }
  ];

  return (
    <div className="min-h-screen bg-ev-dark-200 text-white">
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Spark Coins Section */}
      <section className="py-12 px-6 md:px-8 lg:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-ev-green-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-md">
                <div className="inline-flex items-center space-x-2 glass-card rounded-full px-4 py-1.5 text-sm font-medium">
                  <Zap className="h-4 w-4 text-ev-green-400" />
                  <span className="text-white">New Reward System!</span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold">
                  Earn <span className="text-gradient-green">Spark Coins</span> with every interaction
                </h2>
                
                <p className="text-white/70">
                  Use Spark Coins to get discounts on charging, unlock premium features, or redeem for rewards. 
                  You can earn coins by charging your EV, using our app, and participating in our community.
                </p>
                
                <Button
                  className="bg-ev-green-500 hover:bg-ev-green-600 text-white"
                  asChild
                >
                  <Link to="/signin">
                    Sign In to Start Earning
                    <Zap className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="flex-shrink-0 relative">
                <div className="w-44 h-44 rounded-full bg-ev-dark-300 flex items-center justify-center p-3 animate-float">
                  <div className="w-full h-full rounded-full border-4 border-ev-green-400/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full bg-ev-green-500/5 animate-pulse"></div>
                    <Zap className="h-14 w-14 text-ev-green-400" />
                    <div className="absolute -right-2 -top-2 bg-ev-green-500 text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center">
                      +5
                    </div>
                    <div className="absolute -right-1 -bottom-1 bg-ev-blue-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                      +10
                    </div>
                    <div className="absolute -left-3 top-4 bg-ev-green-600 text-white text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center">
                      +25
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-ev-green-400 font-bold text-xl">+5</div>
                <div className="text-white/60 text-sm">Daily Login</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-ev-green-400 font-bold text-xl">+25</div>
                <div className="text-white/60 text-sm">Complete a Charge</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-ev-green-400 font-bold text-xl">+50</div>
                <div className="text-white/60 text-sm">First-time Setup</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-ev-green-400 font-bold text-xl">+100</div>
                <div className="text-white/60 text-sm">Refer a Friend</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresSectionRef}
        className="py-24 px-6 md:px-8 lg:px-12 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-gradient-green">EV Spark</span>?
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Our cutting-edge platform offers everything you need to make EV charging
              convenient, fast, and hassle-free.
            </p>
          </div>

          <div 
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-1000 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                className={`animate-fade-in`}
                style={{ animationDelay: `${index * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-8 lg:px-12 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-ev-dark-300" />
          <div className="absolute left-1/4 top-1/4 w-64 h-64 bg-ev-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 w-80 h-80 bg-ev-green-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="neo-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-ev-green-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 glass-card rounded-full px-4 py-1.5 text-sm font-medium">
                  <Zap className="h-4 w-4 text-ev-green-400" />
                  <span className="text-white">Join our growing network</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to <span className="text-gradient-green">transform</span> your EV charging experience?
                </h2>
                
                <p className="text-white/70">
                  Sign up today and get access to our exclusive network of charging stations, 
                  smart features, and rewards program designed for EV owners.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    size="lg"
                    className="bg-ev-green-500 hover:bg-ev-green-600 text-white"
                    asChild
                  >
                    <Link to="/signup">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/10 text-white hover:bg-white/5 hover:text-ev-green-400"
                    asChild
                  >
                    <Link to="/stations">
                      Find Stations Near You
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-72 h-72 rounded-full border-4 border-ev-green-500/20 animate-pulse-slow" />
                </div>
                <div className="relative z-10 flex items-center justify-center">
                  <div className="w-56 h-56 neo-card rounded-full flex items-center justify-center animate-float">
                    <Zap className="h-20 w-20 text-ev-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 md:px-8 lg:px-12 relative">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-3xl p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard 
                value="10,000+"
                label="EV Drivers"
                icon={<Smartphone className="h-6 w-6 text-ev-green-400" />}
              />
              <StatCard 
                value="300+"
                label="Charging Stations"
                icon={<MapPin className="h-6 w-6 text-ev-blue-400" />}
              />
              <StatCard 
                value="50+"
                label="Cities Covered"
                icon={<Zap className="h-6 w-6 text-ev-green-400" />}
              />
              <StatCard 
                value="24/7"
                label="Customer Support"
                icon={<Clock className="h-6 w-6 text-ev-blue-400" />}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

interface StatCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const StatCard = ({ value, label, icon }: StatCardProps) => {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <div className="text-3xl md:text-4xl font-bold mb-2">{value}</div>
      <div className="text-white/60">{label}</div>
    </div>
  );
};

export default Index;
