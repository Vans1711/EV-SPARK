import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  MapPin, 
  Search, 
  Battery, 
  Clock, 
  DollarSign, 
  Shield, 
  Users, 
  ChevronRight,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import Hero from '@/components/Hero';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/stations?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const features = [
    {
      icon: <MapPin className="h-6 w-6 text-ev-green-400" />,
      title: "Find Nearby Stations",
      description: "Locate the nearest EV charging stations with real-time availability and pricing."
    },
    {
      icon: <Battery className="h-6 w-6 text-ev-green-400" />,
      title: "Multiple Charging Options",
      description: "Choose from fast, normal, or slow charging based on your needs."
    },
    {
      icon: <Clock className="h-6 w-6 text-ev-green-400" />,
      title: "24/7 Availability",
      description: "Access charging stations round the clock with our extensive network."
    },
    {
      icon: <DollarSign className="h-6 w-6 text-ev-green-400" />,
      title: "Competitive Pricing",
      description: "Get the best rates with our transparent pricing system."
    },
    {
      icon: <Shield className="h-6 w-6 text-ev-green-400" />,
      title: "Secure Payments",
      description: "Safe and secure payment options with multiple methods available."
    },
    {
      icon: <Users className="h-6 w-6 text-ev-green-400" />,
      title: "Community Driven",
      description: "Join our growing community of EV enthusiasts and share experiences."
    }
  ];
  
  const stats = [
    { value: "500+", label: "Charging Stations" },
    { value: "50K+", label: "Happy Users" },
    { value: "24/7", label: "Support" },
    { value: "₹0", label: "Hidden Fees" }
  ];
  
  return (
    <div className="min-h-screen bg-ev-dark-200 flex flex-col">
      <Navbar />
      
      {/* Hero Section with Car Animation */}
      <Hero />
      
      {/* Features Section */}
      <section className="py-24 px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Why Choose <span className="text-ev-green-400">Spark Hub</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Experience the future of EV charging with our comprehensive platform designed for the modern electric vehicle owner.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="neo-card border-white/5 hover:border-ev-green-400/20 hover:shadow-ev-green-400/5 transition-all">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-full bg-ev-green-500/20 flex items-center justify-center">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 px-6 md:px-8 lg:px-12 bg-ev-dark-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="neo-card rounded-3xl p-8 md:p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute -right-40 -bottom-40 w-96 h-96 bg-ev-green-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-40 -top-40 w-96 h-96 bg-ev-blue-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="text-center space-y-6 max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Ready to join the <span className="text-ev-green-400">electric revolution</span>?
                </h2>
                <p className="text-white/70">
                  Sign up today and start enjoying seamless charging experiences across our network of stations.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                  <Button
                    size="lg"
                    className="bg-ev-green-500 hover:bg-ev-green-600 text-white"
                    onClick={() => navigate('/signup')}
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/10 text-white hover:bg-white/5 hover:text-ev-green-400"
                    onClick={() => navigate('/stations')}
                  >
                    Explore Stations
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Home; 