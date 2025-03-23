import { useState } from 'react';
import { BarChart, Battery, Wallet, Clock, Award, Calendar, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScheduleChargingModal from '@/components/ScheduleChargingModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 24 },
  { name: 'Feb', value: 18 },
  { name: 'Mar', value: 29 },
  { name: 'Apr', value: 32 },
  { name: 'May', value: 41 },
  { name: 'Jun', value: 35 },
  { name: 'Jul', value: 38 },
];

const recentSessions = [
  { id: 1, location: 'EV Spark Station #1', date: '23 Jul 2023', time: '35 min', energy: '18.5 kWh', cost: '₹275' },
  { id: 2, location: 'EV Spark Station #3', date: '19 Jul 2023', time: '45 min', energy: '22.3 kWh', cost: '₹335' },
  { id: 3, location: 'EV Spark Station #2', date: '15 Jul 2023', time: '28 min', energy: '14.7 kWh', cost: '₹220' },
];

const actionCards = [
  {
    title: "Find Charging Stations",
    description: "Locate EV charging stations near you",
    icon: <Battery className="h-5 w-5" />,
    link: "/stations"
  },
  {
    title: "Payment Dashboard",
    description: "Scan QR code, make payments & earn rewards",
    icon: <Wallet className="h-5 w-5" />,
    link: "/payment-dashboard"
  },
  {
    title: "Charging History",
    description: "View your recent charging sessions",
    icon: <Clock className="h-5 w-5" />,
    link: "#history"
  },
  {
    title: "Rewards & Points",
    description: "Manage your Spark Coins and benefits",
    icon: <Award className="h-5 w-5" />,
    link: "#rewards"
  }
];

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  
  return (
    <div className="flex flex-col min-h-screen bg-ev-dark-200">
      <Navbar />
      
      <main className="flex-grow pt-24 px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Dashboard</h1>
                <p className="text-white/70 mt-1">Track your EV charging activity and rewards</p>
              </div>
              <Button 
                className="bg-ev-green-500 hover:bg-ev-green-600 text-white"
                onClick={() => setScheduleModalOpen(true)}
              >
                Schedule Charging
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="neo-card">
                <CardHeader className="pb-2">
                  <CardDescription className="text-white/60">Total Energy Consumed</CardDescription>
                  <CardTitle className="text-white text-2xl">245.8 kWh</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-ev-green-400 text-sm flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    12% from last month
                  </div>
                </CardContent>
              </Card>
              
              <Card className="neo-card">
                <CardHeader className="pb-2">
                  <CardDescription className="text-white/60">Spark Rewards</CardDescription>
                  <CardTitle className="text-white text-2xl">1,250 coins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-ev-green-400 text-sm flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    Silver Tier Member
                  </div>
                </CardContent>
              </Card>
              
              <Card className="neo-card">
                <CardHeader className="pb-2">
                  <CardDescription className="text-white/60">Total Sessions</CardDescription>
                  <CardTitle className="text-white text-2xl">32</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-ev-green-400 text-sm flex items-center">
                    <Battery className="h-4 w-4 mr-1" />
                    4 this week
                  </div>
                </CardContent>
              </Card>
              
              <Card className="neo-card">
                <CardHeader className="pb-2">
                  <CardDescription className="text-white/60">Total Spending</CardDescription>
                  <CardTitle className="text-white text-2xl">₹3,680</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white/60 text-sm flex items-center">
                    <Wallet className="h-4 w-4 mr-1" />
                    Avg. ₹15/kWh
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {actionCards.map((card, index) => (
                <Card 
                  key={index}
                  className="bg-ev-dark-100 border-white/5 hover:border-ev-green-500/50 transition-all cursor-pointer hover:bg-ev-dark-100/80"
                  onClick={() => card.link.startsWith('#') 
                    ? setActiveTab(card.link.substring(1)) 
                    : window.location.href = card.link
                  }
                >
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 rounded-full bg-ev-green-500/20 flex items-center justify-center mb-3">
                      <div className="text-ev-green-400">
                        {card.icon}
                      </div>
                    </div>
                    <CardTitle className="text-white text-lg">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/60">
                      {card.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-ev-dark-100 border border-white/10">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6 space-y-6">
                <Card className="neo-card">
                  <CardHeader>
                    <CardTitle className="text-white">Energy Consumption</CardTitle>
                    <CardDescription className="text-white/60">Your charging patterns over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={data}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="name" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0f172a', 
                              borderColor: '#1e293b', 
                              color: '#f8fafc' 
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#10B981" 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="neo-card">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Charging Sessions</CardTitle>
                      <CardDescription className="text-white/60">Your latest 3 charging sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentSessions.map((session) => (
                          <div key={session.id} className="flex justify-between items-center p-3 bg-ev-dark-100/50 rounded-lg">
                            <div>
                              <h4 className="text-white font-medium">{session.location}</h4>
                              <div className="flex items-center text-white/60 text-xs mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                {session.date}
                                <span className="mx-2">•</span>
                                <Clock className="h-3 w-3 mr-1" />
                                {session.time}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white">{session.energy}</div>
                              <div className="text-white/60 text-sm">{session.cost}</div>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full mt-2 border-white/10 text-white hover:bg-white/5 hover:text-ev-green-400">
                          View All Sessions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="neo-card">
                    <CardHeader>
                      <CardTitle className="text-white">Saved Stations</CardTitle>
                      <CardDescription className="text-white/60">Your favorite charging stations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3].map((station) => (
                          <div key={station} className="flex justify-between items-center p-3 bg-ev-dark-100/50 rounded-lg">
                            <div>
                              <h4 className="text-white font-medium">EV Spark Station #{station}</h4>
                              <p className="text-white/60 text-xs mt-1">123 Main Street, New Delhi</p>
                            </div>
                            <Button size="sm" className="bg-ev-green-500 hover:bg-ev-green-600 text-white whitespace-nowrap">
                              Navigate
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full mt-2 border-white/10 text-white hover:bg-white/5 hover:text-ev-green-400">
                          View All Saved Stations
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="mt-6">
                <Card className="neo-card">
                  <CardHeader>
                    <CardTitle className="text-white">Charging History</CardTitle>
                    <CardDescription className="text-white/60">Complete record of your charging sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-white">Station</th>
                            <th className="text-left py-3 px-4 text-white">Date</th>
                            <th className="text-left py-3 px-4 text-white">Duration</th>
                            <th className="text-left py-3 px-4 text-white">Energy</th>
                            <th className="text-left py-3 px-4 text-white">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...recentSessions, ...recentSessions].map((session, index) => (
                            <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-3 px-4 text-white">{session.location}</td>
                              <td className="py-3 px-4 text-white/70">{session.date}</td>
                              <td className="py-3 px-4 text-white/70">{session.time}</td>
                              <td className="py-3 px-4 text-white/70">{session.energy}</td>
                              <td className="py-3 px-4 text-white/70">{session.cost}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="rewards" className="mt-6 space-y-6">
                <Card className="neo-card">
                  <CardHeader>
                    <CardTitle className="text-white">Spark Rewards Program</CardTitle>
                    <CardDescription className="text-white/60">Earn rewards for eco-friendly charging habits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-ev-green-500/20 mb-4">
                        <Award className="h-12 w-12 text-ev-green-400" />
                      </div>
                      <h3 className="text-white text-2xl font-bold">Silver Tier</h3>
                      <p className="text-white/60 mt-1">1,250 coins</p>
                      <div className="w-full bg-ev-dark-100 h-2 rounded-full mt-4 overflow-hidden">
                        <div className="bg-ev-green-500 h-full rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <p className="text-white/60 text-sm mt-2">750 coins until Gold Tier</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        {['10% off charging', 'Priority booking', 'Free monthly check'].map((benefit, index) => (
                          <div key={index} className="p-4 bg-ev-dark-100/50 rounded-lg">
                            <p className="text-white">{benefit}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="neo-card">
                  <CardHeader>
                    <CardTitle className="text-white">Available Rewards</CardTitle>
                    <CardDescription className="text-white/60">Redeem your Spark coins for these benefits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { title: 'Free Charging Session', cost: '500 coins' },
                        { title: '50% Off Charging', cost: '300 coins' },
                        { title: 'Partner Discount', cost: '200 coins' },
                        { title: 'Premium Support', cost: '100 coins' }
                      ].map((reward, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-ev-dark-100/50 rounded-lg">
                          <div>
                            <h4 className="text-white font-medium">{reward.title}</h4>
                            <p className="text-white/60 text-sm">{reward.cost}</p>
                          </div>
                          <Button size="sm" className="bg-ev-green-500 hover:bg-ev-green-600 text-white">
                            Redeem
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <ScheduleChargingModal 
        open={scheduleModalOpen} 
        onOpenChange={setScheduleModalOpen} 
      />
      
      <Footer />
    </div>
  );
};

export default DashboardPage;
