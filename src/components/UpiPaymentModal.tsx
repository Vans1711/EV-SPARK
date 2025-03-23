import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, QrCode, ScanLine, Smartphone, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import QRScanner from './QRScanner';
import QRCodeGenerator from './QRCodeGenerator';
import { upiService } from '@/services/upiService';
import { useSparkCoins } from '@/context/SparkCoinsContext';
import { supabase } from '@/lib/supabase';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

interface UpiPaymentData {
  amount: number;
  description: string;
  booking_id?: string;
  station_id?: string;
  station_name?: string;
}

interface UpiPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentData: UpiPaymentData;
  onPaymentComplete?: (result: { success: boolean; transactionId?: string; sparkCoinsEarned?: number }) => void;
}

const UpiPaymentModal = ({ 
  open, 
  onOpenChange, 
  paymentData,
  onPaymentComplete 
}: UpiPaymentModalProps) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'generate'>('generate');
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const { refetchCoins, addCoins } = useSparkCoins();
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [timer, setTimer] = useState(120);
  const [transactionId, setTransactionId] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Default UPI details for generating our own QR code
  const ourUpiDetails = {
    payeeVpa: 'evsparkhub@okaxis', // This would be your business UPI ID
    payeeName: 'EV Spark Hub'
  };

  // Reset states when modal is opened/closed
  useEffect(() => {
    if (open) {
      setCopied(false);
      setProcessing(false);
      setTimer(120); // 2-minute timer
    }
  }, [open]);
  
  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (open && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && open) {
      // Auto close if timer reaches 0
      onOpenChange(false);
      toast.error('Payment session timed out. Please try again.');
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, open, onOpenChange]);

  const handleScanSuccess = async (data: any) => {
    setScannedData(data);
    setIsScanning(false);
    
    if (data.payeeVpa) {
      toast.success(`Detected payment to: ${data.payeeName || data.payeeVpa}`);
      
      // Start verification process if we have UPI data
      await verifyPayment(data);
    }
  };
  
  const handleScanCancel = () => {
    setIsScanning(false);
  };
  
  const startScanner = () => {
    setIsScanning(true);
    setScannedData(null);
  };

  const verifyPayment = async (data: any) => {
    setIsVerifying(true);
    
    try {
      // In a real app, you would have a more robust verification system
      // Here we're simulating verification after a short delay
      
      // First, initiate the payment record
      const paymentInitResult = await upiService.initiateUpiPayment({
        payeeVpa: data.payeeVpa || ourUpiDetails.payeeVpa,
        payeeName: data.payeeName || ourUpiDetails.payeeName,
        amount: paymentData.amount,
        description: paymentData.description,
        booking_id: paymentData.booking_id,
        station_id: paymentData.station_id
      });
      
      if (!paymentInitResult.success) {
        toast.error(paymentInitResult.message || 'Failed to initiate payment');
        setIsVerifying(false);
        return;
      }
      
      // Simulate a network delay for verification
      // In a real app, you would poll a payment gateway's API to check status
      setTimeout(async () => {
        // Mock verification - in a real app this would call your backend or payment gateway API
        const verificationResult = await upiService.verifyUpiTransaction({
          transactionId: paymentInitResult.transactionId || 'mock_txn_id',
          upiId: data.payeeVpa || ourUpiDetails.payeeVpa,
          amount: paymentData.amount,
          status: 'success' // Simulate success for demo
        });
        
        setIsVerifying(false);
        
        if (verificationResult.success) {
          toast.success(`Payment successful! You earned ${verificationResult.sparkCoinsEarned} Spark Coins.`);
          
          // Refresh the user's spark coins
          refetchCoins();
          
          // Call onPaymentComplete callback if provided
          if (onPaymentComplete) {
            onPaymentComplete({
              success: true,
              transactionId: verificationResult.transactionId,
              sparkCoinsEarned: verificationResult.sparkCoinsEarned
            });
          }
          
          // Close modal after success
          setTimeout(() => {
            onOpenChange(false);
          }, 1500);
        } else {
          toast.error(verificationResult.message || 'Payment verification failed');
        }
      }, 2000); // 2 second simulated verification delay
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('An error occurred during payment verification');
      setIsVerifying(false);
    }
  };

  if (!paymentData) return null;
  
  const amount = typeof paymentData.amount === 'string' 
    ? parseFloat(paymentData.amount) || 0
    : paymentData.amount;
  
  const upiUrl = `upi://pay?pa=${encodeURIComponent(ourUpiDetails.payeeVpa)}&pn=${encodeURIComponent(ourUpiDetails.payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(paymentData.description || 'EV Charging Payment')}`;
  
  const copyUpiId = () => {
    navigator.clipboard.writeText(ourUpiDetails.payeeVpa);
    setCopied(true);
    toast.success('UPI ID copied to clipboard');
    setTimeout(() => setCopied(false), 3000);
  };
  
  const handlePaymentComplete = async () => {
    setProcessing(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For guest users, just show success and don't create a transaction
        toast.success('Payment successful!');
        onPaymentComplete && onPaymentComplete({ success: true });
        onOpenChange(false);
        return;
      }
      
      // Create payment record in database
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          user_id: user.id,
          amount: amount,
          payment_method: 'upi',
          status: 'completed',
          receiver_vpa: ourUpiDetails.payeeVpa,
          receiver_name: ourUpiDetails.payeeName,
          description: paymentData.description || 'EV Charging Payment',
          created_at: new Date().toISOString(),
        }]);
        
      if (paymentError) {
        console.error('Error recording payment:', paymentError);
        toast.error('Failed to record payment. Please contact support.');
        onPaymentComplete && onPaymentComplete({ success: false });
        onOpenChange(false);
        return;
      }
      
      // Calculate spark coins earned (1 coin per ₹10)
      const coinsEarned = Math.floor(amount / 10);
      
      if (coinsEarned > 0) {
        await addCoins(coinsEarned, 'UPI payment');
      }
      
      toast.success(`Payment of ₹${amount} completed successfully!${coinsEarned > 0 ? ` You earned ${coinsEarned} Spark Coins!` : ''}`);
      onPaymentComplete && onPaymentComplete({ success: true });
      onOpenChange(false);
    } catch (error) {
      console.error('Error completing payment:', error);
      toast.error('Failed to complete payment. Please try again.');
      onPaymentComplete && onPaymentComplete({ success: false });
    } finally {
      setProcessing(false);
    }
  };
  
  const openUpiApp = () => {
    window.location.href = upiUrl;
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleInitiatePayment = async () => {
    setTransactionStatus('processing');
    setErrorMessage('');
    
    try {
      // Initiate the payment in our system
      const result = await upiService.initiateUpiPayment(paymentData);
      
      if (result.success) {
        setTransactionId(result.transactionId);
        
        // For demo purposes: Simulate a successful payment after 2 seconds
        setTimeout(() => {
          handleVerifyPayment(result.transactionId);
        }, 2000);
      } else {
        setTransactionStatus('failed');
        setErrorMessage(result.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setTransactionStatus('failed');
      setErrorMessage('An error occurred while initiating payment');
    }
  };
  
  const handleVerifyPayment = async (tid: string) => {
    try {
      // In a real app, this would call a payment gateway's verification API
      // For this demo, we'll just simulate a successful payment
      
      const verificationResult = await upiService.verifyUpiTransaction({
        transactionId: tid,
        upiId: paymentData.payeeVpa,
        amount: paymentData.amount,
        status: 'success' // Simulate success
      });
      
      if (verificationResult.success) {
        setTransactionStatus('success');
        
        // Notify the parent component
        onPaymentComplete && onPaymentComplete({
          success: true,
          transactionId: tid,
          amount: paymentData.amount,
          sparkCoinsEarned: verificationResult.sparkCoinsEarned
        });
      } else {
        setTransactionStatus('failed');
        setErrorMessage(verificationResult.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setTransactionStatus('failed');
      setErrorMessage('An error occurred while verifying payment');
    }
  };
  
  const handleCancel = () => {
    if (transactionStatus === 'processing') {
      // In a real app, you might want to cancel the transaction or mark it as abandoned
      setTransactionStatus('failed');
      setErrorMessage('Payment was cancelled');
    }
    
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={(open) => !open && handleCancel()}>
      <SheetContent className="bg-ev-dark-200 border-l border-white/10 w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-white">UPI Payment</SheetTitle>
          <SheetDescription className="text-white/60">
            Complete your payment of ₹{paymentData.amount}
          </SheetDescription>
        </SheetHeader>
        
        {transactionStatus === 'success' ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-white/60 text-center mb-6">
              Your payment of ₹{paymentData.amount} to {paymentData.payeeName} was successful.
            </p>
            <div className="bg-ev-dark-300/50 rounded-lg p-4 w-full mb-6">
              <div className="flex justify-between text-white/70 mb-2">
                <span>Transaction ID:</span>
                <span className="text-white">{transactionId}</span>
              </div>
              <div className="flex justify-between text-white/70 mb-2">
                <span>Amount:</span>
                <span className="text-white">₹{paymentData.amount}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Date:</span>
                <span className="text-white">{new Date().toLocaleString()}</span>
              </div>
            </div>
            <Button 
              className="w-full bg-ev-green-500 hover:bg-ev-green-600 text-white"
              onClick={handlePaymentComplete}
            >
              Done
            </Button>
          </div>
        ) : transactionStatus === 'failed' ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Payment Failed</h2>
            <p className="text-white/60 text-center mb-6">
              {errorMessage || 'Your payment could not be processed. Please try again.'}
            </p>
            <Button 
              className="w-full bg-ev-green-500 hover:bg-ev-green-600 text-white mb-4"
              onClick={() => setTransactionStatus('idle')}
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/5"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="scan" className="data-[state=active]:text-ev-green-400">
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan
                </TabsTrigger>
                <TabsTrigger value="app" className="data-[state=active]:text-ev-green-400">
                  <Smartphone className="h-4 w-4 mr-2" />
                  App
                </TabsTrigger>
                <TabsTrigger value="direct" className="data-[state=active]:text-ev-green-400">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Direct
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="scan" className="focus-visible:outline-none focus-visible:ring-0">
                <div className="mb-6">
                  <QRCodeGenerator
                    payeeVpa={paymentData.payeeVpa}
                    payeeName={paymentData.payeeName}
                    amount={paymentData.amount}
                    message={paymentData.description}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="app" className="focus-visible:outline-none focus-visible:ring-0">
                <div className="space-y-6">
                  <div className="text-white/70">
                    <p className="mb-4">Choose your UPI app to complete the payment:</p>
                    <div className="grid grid-cols-3 gap-4">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay', 'WhatsApp Pay'].map((app) => (
                        <Button
                          key={app}
                          variant="outline"
                          className="flex flex-col h-20 items-center justify-center border-white/10 hover:bg-white/5 hover:border-ev-green-400"
                          onClick={handleInitiatePayment}
                        >
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-2">
                            <Smartphone className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xs text-white">{app}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="direct" className="focus-visible:outline-none focus-visible:ring-0">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="upiId" className="text-white">Enter your UPI ID</Label>
                    <Input
                      id="upiId"
                      placeholder="username@upi"
                      className="bg-ev-dark-100 border-white/10 text-white"
                    />
                  </div>
                  
                  <div className="bg-ev-dark-300/30 p-4 rounded-lg">
                    <div className="flex justify-between text-white/70 mb-2">
                      <span>Amount:</span>
                      <span className="text-white">₹{paymentData.amount}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>To:</span>
                      <span className="text-white">{paymentData.payeeName}</span>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full bg-ev-green-500 hover:bg-ev-green-600 text-white"
                    onClick={handleInitiatePayment}
                  >
                    Pay Now
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            {transactionStatus === 'processing' && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-ev-dark-200 p-8 rounded-xl max-w-sm w-full">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 text-ev-green-400 animate-spin mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">Processing Payment</h3>
                    <p className="text-white/60 text-center mb-6">
                      Please do not close this window while we process your payment...
                    </p>
                    <Button
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8">
              <Button 
                variant="outline"
                className="w-full border-white/10 text-white hover:bg-white/5"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default UpiPaymentModal; 