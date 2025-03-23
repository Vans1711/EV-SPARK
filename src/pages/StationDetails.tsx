import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Navigation, 
  ArrowLeft, 
  Clock, 
  Zap, 
  Smartphone, 
  Car, 
  Calendar, 
  Star, 
  Info, 
  Building, 
  AlertCircle,
  Loader2,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { stationService, ChargingStation } from '@/services/stationService';
import { useAuth } from '@/context/AuthContext';

// Dynamic ratings generator to simulate reviews
const generateReviews = () => {
  const count = Math.floor(Math.random() * 15) + 5; // 5-20 reviews
  const reviews = [];
  
  for (let i = 0; i < count; i++) {
    const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // Random date in last 90 days
    
    reviews.push({
      id: `review-${i}`,
      name: [
        'Amit Sharma', 'Priya Patel', 'Rajesh Kumar', 'Sneha Gupta', 
        'Vikram Singh', 'Ananya Reddy', 'Arjun Nair', 'Divya Choudhary',
        'Karthik Iyer', 'Neha Verma', 'Rohit Joshi', 'Sanjana Mehta'
      ][Math.floor(Math.random() * 12)],
      rating,
      date: date.toISOString(),
      comment: [
        'Good charging station with reliable service.',
        'Fast charging and convenient location.',
        'Staff was helpful. Clean facility.',
        'Had to wait a bit but overall good experience.',
        'Excellent charging speed. Will use again.',
        'Easy to find and use. Recommended!',
        'The app made paying and monitoring charge super easy.',
        'Perfect location for a quick charge while shopping.',
        'Charging speed was slower than advertised.',
        'Very convenient and well-maintained station.',
        'Great amenities nearby while charging.',
        'Reliable and fast charging experience!'
      ][Math.floor(Math.random() * 12)]
    });
  }
  
  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const StationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [station, setStation] = useState<ChargingStation | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews] = useState(generateReviews());
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  useEffect(() => {
    const fetchStationDetails = async () => {
      if (!id) {
        toast.error('Station ID is missing');
        navigate('/stations');
        return;
      }
      
      try {
        setLoading(true);
        const stationData = await stationService.getStationById(id);
        
        if (!stationData) {
          toast.error('Station not found');
          navigate('/stations');
          return;
        }
        
        setStation(stationData);
      } catch (error) {
        console.error('Error fetching station details:', error);
        toast.error('Failed to load station details');
      } finally {
        setLoading(false);
      }
    };
    
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Error getting location:', error);
        }
      );
    }
    
    fetchStationDetails();
  }, [id, navigate]);
  
  const openInMaps = () => {
    if (!station) return;
    
    const url = userLocation 
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${station.latitude},${station.longitude}&travelmode=driving`
      : `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;
      
    window.open(url, '_blank');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-ev-dark-200 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-ev-green-400 animate-spin mb-4" />
            <h3 className="text-white text-lg font-medium">Loading Station Details</h3>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!station) {
    return (
      <div className="min-h-screen bg-ev-dark-200 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-amber-400 mb-4" />
            <h3 className="text-white text-lg font-medium">Station Not Found</h3>
            <p className="text-white/60 mt-2">The station you're looking for doesn't exist or has been removed.</p>
            <Button 
              className="mt-6 bg-ev-green-500 hover:bg-ev-green-600 text-white"
              onClick={() => navigate('/stations')}
            >
              Back to Stations
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-ev-dark-200 flex flex-col">
      <Navbar />
      
      <div className="flex-grow px-6 py-24 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <Link to="/stations" className="inline-flex items-center text-white/70 hover:text-white transition-colors group mb-4">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Stations
            </Link>
            
            <div className="bg-gradient-to-r from-ev-dark-100 to-ev-dark-300 rounded-xl p-6 border border-white/5">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{station.name}</h1>
                  <div className="flex items-start text-white/60 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1 text-ev-green-400 mt-0.5" />
                    <span>{station.address}, {station.city}, {station.state}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    <Badge className={station.available ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                      {station.available ? "Available" : "Currently Busy"}
                    </Badge>
                    <Badge className="bg-white/10 text-white">
                      <Star className="h-3.5 w-3.5 mr-1 text-yellow-400" />
                      {averageRating.toFixed(1)} ({reviews.length} reviews)
                    </Badge>
                    <Badge className="bg-white/10 text-white">
                      <Building className="h-3.5 w-3.5 mr-1 text-ev-green-400" />
                      {station.operator}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    className="bg-ev-green-500 hover:bg-ev-green-600 text-white"
                    onClick={() => navigate('/payment-dashboard')}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Start Charging
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white/10 text-white hover:bg-white/5"
                    onClick={openInMaps}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Navigate
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="neo-card border-white/5 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Station Information</CardTitle>
                  <CardDescription className="text-white/60">
                    Details and available charging options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-white font-medium mb-2">Charging Options</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center bg-ev-dark-300/50 p-3 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-ev-green-500/20 flex items-center justify-center mr-3">
                                <Zap className="h-4 w-4 text-ev-green-400" />
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">Fast Charging</p>
                                <p className="text-white/60 text-xs">{station.power_kw} kW</p>
                              </div>
                            </div>
                            <span className="text-white font-medium">₹{station.price_per_kwh}/kWh</span>
                          </div>
                          
                          <h4 className="text-white/70 text-sm font-medium mt-4">Available Connectors:</h4>
                          <div className="flex flex-wrap gap-2">
                            {station.connector_types.map((type, index) => (
                              <Badge key={index} className="bg-ev-dark-100 text-white">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-white font-medium mb-2">Operating Hours</h3>
                        <div className="bg-ev-dark-300/50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-ev-green-500/20 flex items-center justify-center mr-3">
                              <Clock className="h-4 w-4 text-ev-green-400" />
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">Open 24/7</p>
                              <p className="text-white/60 text-xs">Available all days</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-white font-medium mb-2">Amenities</h3>
                        <div className="bg-ev-dark-300/50 p-3 rounded-lg">
                          <ul className="text-white text-sm space-y-2">
                            <li className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-ev-green-500/20 flex items-center justify-center mr-2">
                                <Check className="h-3 w-3 text-ev-green-400" />
                              </div>
                              Restrooms
                            </li>
                            <li className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-ev-green-500/20 flex items-center justify-center mr-2">
                                <Check className="h-3 w-3 text-ev-green-400" />
                              </div>
                              Food & Beverages
                            </li>
                            <li className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-ev-green-500/20 flex items-center justify-center mr-2">
                                <Check className="h-3 w-3 text-ev-green-400" />
                              </div>
                              WiFi Available
                            </li>
                            <li className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-ev-green-500/20 flex items-center justify-center mr-2">
                                <Check className="h-3 w-3 text-ev-green-400" />
                              </div>
                              Accessibility Features
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-white font-medium mb-2">Payment Options</h3>
                        <div className="bg-ev-dark-300/50 p-3 rounded-lg">
                          <ul className="text-white text-sm grid grid-cols-2 gap-2">
                            <li className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-ev-green-500/20 flex items-center justify-center mr-2">
                                <Check className="h-3 w-3 text-ev-green-400" />
                              </div>
                              Credit/Debit Cards
                            </li>
                            <li className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-ev-green-500/20 flex items-center justify-center mr-2">
                                <Check className="h-3 w-3 text-ev-green-400" />
                              </div>
                              UPI Payments
                              <Badge className="ml-2 bg-ev-green-500/20 text-ev-green-400 text-xs">
                                QR Scannable
                              </Badge>
                            </li>
                            <li className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-ev-green-500/20 flex items-center justify-center mr-2">
                                <Check className="h-3 w-3 text-ev-green-400" />
                              </div>
                              Mobile Payments
                            </li>
                            <li className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-ev-green-500/20 flex items-center justify-center mr-2">
                                <Check className="h-3 w-3 text-ev-green-400" />
                              </div>
                              Spark Wallet
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  <div>
                    <h3 className="text-white font-medium mb-3">Compatible Vehicles</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {[
                        'Tata Nexon EV', 'MG ZS EV', 'Hyundai Kona', 'Mahindra XUV400',
                        'BYD Atto 3', 'Kia EV6', 'Mercedes EQC', 'Audi e-tron'
                      ].map((vehicle, index) => (
                        <div 
                          key={index}
                          className="bg-ev-dark-300/50 rounded-lg p-3 flex items-center"
                        >
                          <Car className="h-4 w-4 text-ev-green-400 mr-2" />
                          <span className="text-white text-sm">{vehicle}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="neo-card border-white/5 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Reviews & Ratings</CardTitle>
                  <CardDescription className="text-white/60">
                    Feedback from other EV drivers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
                    <div className="bg-ev-dark-300/50 p-4 rounded-lg text-center md:w-48">
                      <div className="text-5xl font-bold text-white mb-1">{averageRating.toFixed(1)}</div>
                      <div className="flex justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`h-5 w-5 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-white/20'}`} 
                            fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                      <p className="text-white/60 text-sm">{reviews.length} reviews</p>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-3">Rating Distribution</h3>
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviews.filter(r => r.rating === rating).length;
                        const percentage = Math.round((count / reviews.length) * 100);
                        
                        return (
                          <div key={rating} className="flex items-center mb-2">
                            <div className="flex items-center w-16">
                              <span className="text-white/70 text-sm mr-1">{rating}</span>
                              <Star className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" />
                            </div>
                            <div className="flex-1 h-2 bg-ev-dark-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-ev-green-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-white/70 text-sm ml-3 w-12">{percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <Separator className="bg-white/10 mb-6" />
                  
                  <div className="space-y-6">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="border-b border-white/10 pb-5 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-white font-medium">{review.name}</h4>
                            <div className="flex items-center">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star}
                                    className={`h-3.5 w-3.5 ${star <= review.rating ? 'text-yellow-400' : 'text-white/20'}`} 
                                    fill={star <= review.rating ? 'currentColor' : 'none'}
                                  />
                                ))}
                              </div>
                              <span className="text-white/50 text-xs ml-2">
                                {formatDate(review.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-white/70 text-sm">{review.comment}</p>
                      </div>
                    ))}
                    
                    {reviews.length > 5 && (
                      <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                        View All {reviews.length} Reviews
                      </Button>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-ev-dark-300/30 border-t border-white/10">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-white/70 text-sm">
                      {user ? 'Have you used this station?' : 'Login to leave a review'}
                    </span>
                    {user ? (
                      <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        Write a Review
                      </Button>
                    ) : (
                      <Button 
                        className="bg-ev-green-500 hover:bg-ev-green-600 text-white"
                        onClick={() => navigate('/signin')}
                      >
                        Log In
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="neo-card border-white/5 shadow-lg">
                <CardContent className="p-0">
                  <div className="h-56 bg-ev-dark-300">
                    <iframe 
                      title="Station Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${station.longitude - 0.01},${station.latitude - 0.01},${station.longitude + 0.01},${station.latitude + 0.01}&layer=mapnik&marker=${station.latitude},${station.longitude}`}
                      style={{ border: '0' }}
                    ></iframe>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-2">Location</h3>
                    <p className="text-white/70 text-sm mb-4">{station.address}, {station.city}, {station.state}, {station.postal_code}</p>
                    
                    <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5" onClick={openInMaps}>
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="neo-card border-white/5 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center bg-ev-dark-300/50 p-3 rounded-lg mb-4">
                    <div className={`w-3 h-3 rounded-full mr-2 ${station.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {station.available ? 'Available' : 'Currently Busy'}
                      </p>
                      <p className="text-white/60 text-xs">
                        {station.available 
                          ? 'Charging ports are available' 
                          : 'All ports currently in use, please wait'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-white/70 text-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Last Updated:</span>
                      <span className="text-white">{formatDate(station.last_updated)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Wait Time:</span>
                      <span className="text-white">{station.available ? 'No wait' : 'Approx. 25 mins'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Connectors Available:</span>
                      <span className="text-white">{station.available ? station.connector_types.length : '0'}/{station.connector_types.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="neo-card border-white/5 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-ev-green-500 hover:bg-ev-green-600 text-white">
                    <Zap className="h-4 w-4 mr-2" />
                    Start Charging
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 text-white hover:bg-white/5"
                    onClick={() => navigate('/payment-dashboard')}
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Pay with Spark Wallet
                  </Button>
                  <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book a Slot
                  </Button>
                  <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Notify When Available
                  </Button>
                  <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/5">
                    <Info className="h-4 w-4 mr-2" />
                    Report an Issue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StationDetails; 