import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSparkCoins } from '@/context/SparkCoinsContext';
import { supabase } from '@/lib/supabase';
import { User, Booking } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User as UserIcon, 
  Zap, 
  Battery, 
  MapPin, 
  Clock, 
  Calendar, 
  ChevronRight, 
  LogOut,
  Edit
} from 'lucide-react';

// Demo data for charging history
const demoChargingHistory = [
  {
    id: '1',
    station_name: 'Central EV Charging Hub',
    date: '2023-12-15',
    duration: '45 min',
    energy: '22 kWh',
    cost: '₹330',
    coins_earned: 33,
  },
  {
    id: '2',
    station_name: 'Green Park Charging Station',
    date: '2023-11-28',
    duration: '30 min',
    energy: '15 kWh',
    cost: '₹225',
    coins_earned: 22,
  },
  {
    id: '3',
    station_name: 'Highway Fast Charger',
    date: '2023-11-10',
    duration: '20 min',
    energy: '18 kWh',
    cost: '₹270',
    coins_earned: 27,
  }
];

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { coins, history } = useSparkCoins();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chargingHistory, setChargingHistory] = useState(demoChargingHistory);
  const [totalChargingSessions, setTotalChargingSessions] = useState(demoChargingHistory.length);
  
  useEffect(() => {
    // Redirect if not logged in
    if (!user && !isLoading) {
      navigate('/signin', { replace: true });
    }
  }, [user, isLoading, navigate]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // Fetch user profile data
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user data:', error);
          return;
        }
        
        setUserData(data);
        
        // Fetch user's booking history
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            station:station_id (name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          return;
        }
        
        if (bookingsData && bookingsData.length > 0) {
          setBookings(bookingsData);
          setTotalChargingSessions(bookingsData.length);
        }
      } catch (error) {
        console.error('Error in profile data fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  // If the user is not logged in yet, show a loading state
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-ev-dark-200">
        <Navbar />
        <main className="flex-grow pt-24 px-6 md:px-8 lg:px-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl text-white mb-4">Loading profile...</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Get user initials for avatar fallback
  const userInitials = user.user_metadata?.name 
    ? `${user.user_metadata.name.charAt(0)}${user.user_metadata.name.split(' ')[1]?.charAt(0) || ''}`
    : user.email?.charAt(0) || 'U';
    
  // Get user name
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  
  return (
    <div className="flex flex-col min-h-screen bg-ev-dark-200">
      <Navbar />
      
      <main className="flex-grow pt-24 px-6 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Your Profile</h1>
            
            {/* Profile Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="neo-card col-span-1">
                <CardHeader className="flex flex-col items-center text-center pb-2">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={userData?.profile_image || ''} />
                    <AvatarFallback className="bg-ev-green-500 text-white text-xl">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-white text-2xl">{userName}</CardTitle>
                  <CardDescription className="text-white/60">
                    {user.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-ev-green-400" />
                        <span className="text-white">Spark Coins</span>
                      </div>
                      <Badge className="bg-ev-green-500 text-white">{coins}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Battery className="h-5 w-5 text-ev-green-400" />
                        <span className="text-white">Charging Sessions</span>
                      </div>
                      <Badge className="bg-ev-dark-300 text-white">{totalChargingSessions}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-ev-green-400" />
                        <span className="text-white">Member Since</span>
                      </div>
                      <span className="text-white/60 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <Separator className="my-4 bg-white/10" />
                    
                    <div className="flex justify-between pt-2">
                      <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button variant="destructive" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Tabs Section */}
              <div className="neo-card col-span-1 lg:col-span-2">
                <Tabs defaultValue="charging">
                  <div className="px-6 pt-6">
                    <TabsList className="grid w-full grid-cols-2 bg-ev-dark-100 border border-white/10">
                      <TabsTrigger value="charging">Charging History</TabsTrigger>
                      <TabsTrigger value="coins">Coins History</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="charging" className="p-6 space-y-4">
                    <h3 className="text-lg font-medium text-white">Recent Charging Sessions</h3>
                    
                    {chargingHistory.length > 0 ? (
                      <div className="space-y-4">
                        {chargingHistory.map((session) => (
                          <Card key={session.id} className="neo-card bg-ev-dark-100 border-white/5">
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                  <h4 className="text-white font-medium">{session.station_name}</h4>
                                  <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{session.date}</span>
                                    <Clock className="h-3 w-3 ml-2" />
                                    <span>{session.duration}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <div className="flex items-center gap-1">
                                    <Battery className="h-4 w-4 text-ev-green-400" />
                                    <span className="text-white">{session.energy}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-white/60 text-sm">{session.cost}</span>
                                    <Badge className="bg-ev-green-500/20 text-ev-green-400 ml-2">
                                      +{session.coins_earned} coins
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                          View All Charging History
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-white/60">No charging history yet</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="coins" className="p-6 space-y-4">
                    <h3 className="text-lg font-medium text-white">Spark Coins Activity</h3>
                    
                    {history.length > 0 ? (
                      <div className="space-y-4">
                        {history.slice(0, 5).map((transaction) => (
                          <Card key={transaction.id} className="neo-card bg-ev-dark-100 border-white/5">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="text-white font-medium">{transaction.description}</h4>
                                  <p className="text-white/60 text-sm">
                                    {new Date(transaction.timestamp).toLocaleDateString()} at {new Date(transaction.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                                <Badge className={transaction.type === 'earned' 
                                  ? "bg-green-500/20 text-green-400" 
                                  : "bg-red-500/20 text-red-400"}>
                                  {transaction.type === 'earned' ? '+' : '-'}{Math.abs(transaction.amount)}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                          View All Transactions
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-white/60">No coin transactions yet</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfilePage; 