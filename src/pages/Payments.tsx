
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, QrCode, Smartphone, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { toast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentMethods = [
  {
    id: 'card',
    title: 'Credit / Debit Card',
    description: 'Pay securely with your card',
    icon: CreditCard
  },
  {
    id: 'upi',
    title: 'UPI',
    description: 'Pay using any UPI app',
    icon: QrCode
  },
  {
    id: 'wallet',
    title: 'Digital Wallet',
    description: 'Pay via linked digital wallet',
    icon: Wallet
  },
  {
    id: 'mobile',
    title: 'Mobile Payment',
    description: 'Pay with mobile banking',
    icon: Smartphone
  }
];

const demoSessionData = {
  stationName: "EcoCharge Supercharger",
  location: "123 Green Avenue, Tech City",
  duration: "45 minutes",
  energyUsed: "32.4 kWh",
  rate: "₹15/kWh",
  subtotal: "₹486",
  discount: "₹50",
  total: "₹436"
};

const Payments = () => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Payment Successful!",
        description: "Your payment has been processed. You earned 43 Spark Coins!",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-ev-dark-200 flex flex-col">
      <Navbar />
      
      <div className="flex-grow px-6 py-24 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-white/70 hover:text-white transition-colors group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mt-4">Payment</h1>
            <p className="text-white/60 mt-2">Complete your payment for the charging session</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="neo-card border-white/5 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Payment Method</CardTitle>
                  <CardDescription className="text-white/60">
                    Select your preferred payment method
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={setPaymentMethod}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {PaymentMethods.map((method) => (
                      <Label
                        key={method.id}
                        htmlFor={method.id}
                        className={`flex p-4 cursor-pointer rounded-lg border transition-all ${
                          paymentMethod === method.id 
                            ? 'border-ev-green-500 bg-ev-green-500/5' 
                            : 'border-white/10 hover:border-white/20 bg-ev-dark-100'
                        }`}
                      >
                        <RadioGroupItem 
                          value={method.id} 
                          id={method.id} 
                          className="sr-only" 
                        />
                        <div className="flex items-center space-x-3">
                          <div className={`rounded-full p-2 ${
                            paymentMethod === method.id 
                              ? 'bg-ev-green-500 text-white' 
                              : 'bg-ev-dark-200 text-white/60'
                          }`}>
                            <method.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{method.title}</p>
                            <p className="text-white/60 text-sm">{method.description}</p>
                          </div>
                        </div>
                        {paymentMethod === method.id && (
                          <div className="ml-auto flex items-center">
                            <Check className="h-5 w-5 text-ev-green-500" />
                          </div>
                        )}
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
              
              {paymentMethod === 'card' && (
                <Card className="neo-card border-white/5 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Card Details</CardTitle>
                    <CardDescription className="text-white/60">
                      Enter your card information securely
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="cardName" className="text-white">Cardholder Name</Label>
                      <Input 
                        id="cardName" 
                        placeholder="Enter cardholder name" 
                        className="bg-ev-dark-100 border-white/10 text-white"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="cardNumber" className="text-white">Card Number</Label>
                      <Input 
                        id="cardNumber" 
                        placeholder="1234 5678 9012 3456" 
                        className="bg-ev-dark-100 border-white/10 text-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="expiry" className="text-white">Expiry Date</Label>
                        <Input 
                          id="expiry" 
                          placeholder="MM/YY" 
                          className="bg-ev-dark-100 border-white/10 text-white"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="cvc" className="text-white">CVC</Label>
                        <Input 
                          id="cvc" 
                          placeholder="123" 
                          className="bg-ev-dark-100 border-white/10 text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-3">
                      <Switch 
                        id="saveCard" 
                        checked={savePaymentInfo}
                        onCheckedChange={setSavePaymentInfo}
                      />
                      <Label htmlFor="saveCard" className="text-white cursor-pointer">
                        Save this card for future payments
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {paymentMethod === 'upi' && (
                <Card className="neo-card border-white/5 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white">UPI Payment</CardTitle>
                    <CardDescription className="text-white/60">
                      Scan the QR code or enter your UPI ID
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-white p-6 rounded-lg mx-auto w-64 h-64 flex items-center justify-center">
                      <svg width="200" height="200" viewBox="0 0 100 100">
                        <path d="M1,1 h7 v7 h-7 z M9,1 h1 v1 h-1 z M11,1 h2 v2 h-2 z M14,1 h2 v4 h-2 z M17,1 h1 v2 h-1 z M19,1 h1 v1 h-1 z M21,1 h7 v7 h-7 z M3,3 h3 v3 h-3 z M23,3 h3 v3 h-3 z M10,4 h1 v2 h-1 z M12,4 h1 v3 h-1 z M18,4 h2 v3 h-2 z M1,9 h2 v1 h-2 z M4,9 h1 v1 h-1 z M7,9 h1 v3 h-1 z M10,9 h3 v1 h-3 z M14,9 h3 v1 h-3 z M19,9 h1 v2 h-1 z M21,9 h1 v1 h-1 z M24,9 h2 v2 h-2 z M27,9 h1 v1 h-1 z M2,10 h1 v1 h-1 z M5,10 h1 v1 h-1 z M9,10 h1 v4 h-1 z M15,10 h1 v2 h-1 z M22,10 h1 v2 h-1 z M26,10 h1 v3 h-1 z M1,11 h1 v1 h-1 z M3,11 h3 v1 h-3 z M14,11 h1 v1 h-1 z M18,11 h1 v3 h-1 z M1,12 h1 v1 h-1 z M6,12 h1 v1 h-1 z M8,12 h1 v3 h-1 z M11,12 h1 v1 h-1 z M13,12 h1 v1 h-1 z M16,12 h1 v1 h-1 z M20,12 h1 v1 h-1 z M24,12 h1 v1 h-1 z M2,13 h1 v1 h-1 z M4,13 h2 v1 h-2 z M10,13 h1 v1 h-1 z M12,13 h1 v2 h-1 z M15,13 h1 v1 h-1 z M17,13 h1 v1 h-1 z M19,13 h1 v2 h-1 z M21,13 h2 v1 h-2 z M27,13 h1 v1 h-1 z M1,14 h1 v1 h-1 z M3,14 h2 v2 h-2 z M6,14 h1 v2 h-1 z M14,14 h1 v1 h-1 z M16,14 h1 v1 h-1 z M22,14 h1 v3 h-1 z M24,14 h2 v1 h-2 z M7,15 h1 v1 h-1 z M10,15 h2 v1 h-2 z M20,15 h1 v1 h-1 z M26,15 h1 v1 h-1 z M1,17 h7 v7 h-7 z M9,17 h2 v1 h-2 z M12,17 h4 v1 h-4 z M18,17 h1 v1 h-1 z M20,17 h1 v2 h-1 z M25,17 h1 v1 h-1 z M27,17 h1 v1 h-1 z M3,19 h3 v3 h-3 z M8,19 h2 v2 h-2 z M11,19 h1 v1 h-1 z M13,19 h1 v2 h-1 z M15,19 h1 v1 h-1 z M17,19 h2 v4 h-2 z M22,19 h1 v1 h-1 z M24,19 h1 v3 h-1 z M26,19 h1 v1 h-1 z M10,20 h1 v1 h-1 z M12,20 h1 v3 h-1 z M14,20 h1 v1 h-1 z M16,20 h1 v2 h-1 z M19,20 h1 v1 h-1 z M21,20 h1 v2 h-1 z M25,20 h1 v4 h-1 z M27,20 h1 v7 h-1 z M9,21 h1 v2 h-1 z M15,21 h1 v1 h-1 z M22,21 h2 v1 h-2 z M26,21 h1 v1 h-1 z M1,25 h3 v1 h-3 z M5,25 h1 v1 h-1 z M7,25 h1 v2 h-1 z M9,25 h1 v1 h-1 z M11,25 h2 v1 h-2 z M14,25 h2 v1 h-2 z M19,25 h1 v1 h-1 z M21,25 h1 v1 h-1 z M2,26 h3 v1 h-3 z M6,26 h1 v1 h-1 z M8,26 h2 v1 h-2 z M11,26 h2 v1 h-2 z M15,26 h3 v1 h-3 z M20,26 h3 v1 h-3 z M24,26 h1 v1 h-1 z M1,27 h1 v1 h-1 z M3,27 h3 v1 h-3 z" fill="#000000" />
                      </svg>
                    </div>
                    
                    <div className="text-center text-white/60 text-sm">
                      Scan with any UPI app to pay
                    </div>
                    
                    <div className="- space-y-3">
                      <Label htmlFor="upiId" className="text-white">Or enter UPI ID</Label>
                      <Input 
                        id="upiId" 
                        placeholder="username@upi" 
                        className="bg-ev-dark-100 border-white/10 text-white"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Similar cards for other payment methods would go here */}
              
              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-ev-green-500 hover:bg-ev-green-600 text-white py-6 text-lg"
              >
                {isProcessing ? "Processing..." : `Pay ${demoSessionData.total}`}
              </Button>
            </div>
            
            <div>
              <Card className="neo-card border-white/5 shadow-lg sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white">Charging Summary</CardTitle>
                  <CardDescription className="text-white/60">
                    Details of your charging session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">Station:</span>
                      <span className="text-white font-medium">{demoSessionData.stationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Location:</span>
                      <span className="text-white">{demoSessionData.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Duration:</span>
                      <span className="text-white">{demoSessionData.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Energy Used:</span>
                      <span className="text-white">{demoSessionData.energyUsed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Rate:</span>
                      <span className="text-white">{demoSessionData.rate}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">Subtotal:</span>
                      <span className="text-white">{demoSessionData.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-ev-green-400">
                      <span>Loyalty Discount:</span>
                      <span>-{demoSessionData.discount}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Total:</span>
                      <span className="text-white font-bold text-xl">{demoSessionData.total}</span>
                    </div>
                    <div className="text-ev-green-400 text-sm text-right mt-1">
                      Earn 43 Spark Coins with this payment!
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-white/10 text-white/60 text-sm">
                  <p>Need help? Contact our support team</p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Payments;
