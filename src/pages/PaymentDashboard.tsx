import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, QrCode, Wallet, Zap, RefreshCw, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QRScanner from '@/components/QRScanner';
import SparkWallet from '@/components/SparkWallet';
import UpiPaymentModal from '@/components/UpiPaymentModal';
import { upiService } from '@/services/upiService';
import { useSparkCoins } from '@/context/SparkCoinsContext';

const PaymentDashboard = () => {
  const [activeTab, setActiveTab] = useState('wallet');
  const [isScanning, setIsScanning] = useState(false);
  const [showUpiPaymentModal, setShowUpiPaymentModal] = useState(false);
  const [upiData, setUpiData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addCoins } = useSparkCoins();
  
  // Fetch payment history when component mounts
  useEffect(() => {
    fetchPaymentHistory();
  }, []);
  
  const fetchPaymentHistory = async () => {
    setIsLoading(true);
    try {
      const result = await upiService.getPaymentHistory();
      if (result.success) {
        setPaymentHistory(result.payments || []);
      } else {
        toast.error('Failed to fetch payment history');
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast.error('Failed to fetch payment history');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScanButtonClick = () => {
    setIsScanning(true);
  };
  
  const handleScanSuccess = (data) => {
    setIsScanning(false);
    
    // Process the QR scan data
    let processedData;
    
    // If data is already in UPI format
    if (data.payeeVpa || data.data?.startsWith('upi://')) {
      // Parse UPI data if it's raw UPI URL
      if (data.data?.startsWith('upi://')) {
        processedData = upiService.parseUpiQrCode(data.data);
      } else {
        processedData = data;
      }
      
      // Handle the UPI payment
      if (processedData?.payeeVpa) {
        setUpiData({
          payeeVpa: processedData.payeeVpa,
          payeeName: processedData.payeeName || 'EV Charging Station',
          amount: processedData.amount ? Number(processedData.amount) : 0,
          description: processedData.description || 'EV Charging Payment'
        });
        setShowUpiPaymentModal(true);
      } else {
        toast.error('Invalid UPI QR code');
      }
    } else {
      toast.error('Unsupported QR code format');
    }
  };
  
  const handleScanCancel = () => {
    setIsScanning(false);
  };
  
  const handleUpiPaymentComplete = (result) => {
    setShowUpiPaymentModal(false);
    
    if (result.success) {
      toast.success('Payment completed successfully!');
      
      // Award Spark Coins - 1 for every ₹10 spent
      if (result.amount) {
        const coinsEarned = Math.floor(result.amount / 10);
        if (coinsEarned > 0) {
          addCoins(coinsEarned, 'UPI Payment Reward');
        }
      }
      
      // Refresh payment history
      fetchPaymentHistory();
    } else {
      toast.error(result.message || 'Payment failed');
    }
  };
  
  const handleAddFunds = () => {
    // This would be replaced with a real payment gateway in production
    toast.success('This would open a payment gateway to add funds in a real app');
  };
  
  const handleUseCoinsForPayment = () => {
    // This would be replaced with real Spark Coins payment in production
    toast.success('Your Spark Coins were used for payment');
  };
  
  return (
    <div className="min-h-screen bg-ev-dark-200 flex flex-col">
      <Navbar />
      
      <div className="flex-grow px-6 py-12 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-white/70 hover:text-white transition-colors group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mt-4">Payment Dashboard</h1>
            <p className="text-white/60 mt-2">Manage payments, scan QR codes, and track your Spark Coins</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-ev-dark-300/50 w-full mb-6">
                  <TabsTrigger value="wallet" className="flex-1">
                    <Wallet className="h-4 w-4 mr-2" />
                    Spark Wallet
                  </TabsTrigger>
                  <TabsTrigger value="scan" className="flex-1">
                    <QrCode className="h-4 w-4 mr-2" />
                    Scan & Pay
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">
                    <History className="h-4 w-4 mr-2" />
                    Payment History
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="wallet" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <SparkWallet 
                    onAddFunds={handleAddFunds}
                    onUseCoinsPay={handleUseCoinsForPayment}
                  />
                </TabsContent>
                
                <TabsContent value="scan" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <Card className="neo-card border-white/5 shadow-lg overflow-hidden bg-ev-dark-100">
                    <CardHeader className="bg-ev-dark-300/30 pb-4">
                      <CardTitle className="text-white flex items-center">
                        <QrCode className="h-5 w-5 text-ev-green-400 mr-2" />
                        Scan QR Code to Pay
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Scan UPI QR codes from EV charging stations and earn Spark Coins
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <div className="bg-ev-dark-300/50 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
                        <QrCode className="h-16 w-16 text-ev-green-400 mb-6 opacity-70" />
                        <h3 className="text-white font-medium text-lg mb-2">Ready to Scan</h3>
                        <p className="text-white/60 text-center mb-6 max-w-md">
                          Scan a UPI QR code from any EV charging station to make a quick payment and earn Spark Coins
                        </p>
                        
                        <Button 
                          onClick={handleScanButtonClick} 
                          className="bg-ev-green-500 hover:bg-ev-green-600 text-white"
                          size="lg"
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Start Scanning
                        </Button>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="bg-ev-dark-300/10 p-4 border-t border-white/5">
                      <p className="text-white/40 text-sm">
                        Scan any UPI QR code to pay for charging. Earn 1 Spark Coin for every ₹10 spent.
                      </p>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <Card className="neo-card border-white/5 shadow-lg overflow-hidden bg-ev-dark-100">
                    <CardHeader className="bg-ev-dark-300/30 pb-4 flex flex-row justify-between items-center">
                      <div>
                        <CardTitle className="text-white flex items-center">
                          <History className="h-5 w-5 text-ev-green-400 mr-2" />
                          Payment History
                        </CardTitle>
                        <CardDescription className="text-white/60">
                          Your recent payment transactions
                        </CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={fetchPaymentHistory}
                        className="border-white/10 text-white hover:bg-white/5"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      {isLoading ? (
                        <div className="flex justify-center items-center min-h-[300px]">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ev-green-400"></div>
                        </div>
                      ) : paymentHistory.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                          <AnimatePresence>
                            {paymentHistory.map((payment) => (
                              <motion.div
                                key={payment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center justify-between bg-ev-dark-200/50 p-4 rounded-lg"
                              >
                                <div className="flex items-center">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                    payment.status === 'completed' ? 'bg-green-500/20' : 
                                    payment.status === 'pending' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                                  }`}>
                                    {payment.status === 'completed' ? (
                                      <Zap className="h-5 w-5 text-green-500" />
                                    ) : payment.status === 'pending' ? (
                                      <RefreshCw className="h-5 w-5 text-yellow-500" />
                                    ) : (
                                      <Wallet className="h-5 w-5 text-red-500" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-white text-sm font-medium">
                                      {payment.description || 'Payment'}
                                    </p>
                                    <p className="text-white/40 text-xs">
                                      {new Date(payment.created_at).toLocaleString()}
                                    </p>
                                    <p className="text-white/60 text-xs mt-1">
                                      {payment.payment_method === 'upi' ? 'UPI' : payment.payment_method}
                                      {payment.receiver_name ? ` to ${payment.receiver_name}` : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-white font-medium">₹{payment.amount}</p>
                                  <p className={`text-xs ${
                                    payment.status === 'completed' ? 'text-green-500' : 
                                    payment.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                                  }`}>
                                    {payment.status === 'completed' ? 'Completed' : 
                                     payment.status === 'pending' ? 'Pending' : 'Failed'}
                                  </p>
                                  {payment.spark_coins_earned > 0 && (
                                    <p className="text-ev-green-400 text-xs flex items-center justify-end mt-1">
                                      <Zap className="h-3 w-3 mr-1" />
                                      {payment.spark_coins_earned} coins earned
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center min-h-[300px] text-white/60">
                          <History className="h-16 w-16 mb-4 opacity-30" />
                          <p className="mb-2">No payment history found</p>
                          <p className="text-sm text-white/40">Your transactions will appear here</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div>
              <Card className="neo-card border-white/5 shadow-lg overflow-hidden bg-ev-dark-100 sticky top-8">
                <CardHeader className="bg-ev-dark-300/30 pb-4">
                  <CardTitle className="text-white flex items-center">
                    <Zap className="h-5 w-5 text-ev-green-400 mr-2" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Manage your payments and rewards
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Button 
                      className="w-full bg-ev-green-500 hover:bg-ev-green-600 text-white"
                      onClick={() => setActiveTab('scan')}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Scan & Pay
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-white/10 text-white hover:bg-white/5"
                      onClick={() => setActiveTab('wallet')}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      View Wallet
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-white/10 text-white hover:bg-white/5"
                      onClick={() => setActiveTab('history')}
                    >
                      <History className="h-4 w-4 mr-2" />
                      View History
                    </Button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-ev-dark-300/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2 flex items-center">
                      <Zap className="h-4 w-4 text-ev-green-400 mr-1" />
                      Spark Coins Rewards
                    </h3>
                    <p className="text-white/60 text-sm mb-3">
                      Get rewarded for every payment you make. Earn 1 Spark Coin for every ₹10 spent via UPI.
                    </p>
                    <Link 
                      to="/dashboard" 
                      className="text-ev-green-400 text-sm font-medium hover:text-ev-green-300 inline-flex items-center"
                    >
                      Learn More
                      <ArrowLeft className="ml-1 h-3 w-3 rotate-180" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      {/* QR Scanner Dialog */}
      <Dialog open={isScanning} onOpenChange={setIsScanning}>
        <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-md mx-auto">
          <QRScanner onScanSuccess={handleScanSuccess} onCancel={handleScanCancel} />
        </DialogContent>
      </Dialog>
      
      {/* UPI Payment Modal */}
      {upiData && (
        <UpiPaymentModal
          isOpen={showUpiPaymentModal}
          onClose={() => setShowUpiPaymentModal(false)}
          paymentData={upiData}
          onPaymentComplete={handleUpiPaymentComplete}
        />
      )}
    </div>
  );
};

export default PaymentDashboard; 