import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Plus, ArrowDown, ArrowUp, Calendar, Wallet } from 'lucide-react';
import { useSparkCoins } from '@/context/SparkCoinsContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface SparkWalletProps {
  onAddFunds: () => void;
  onUseCoinsPay: () => void;
}

const SparkWallet = ({ onAddFunds, onUseCoinsPay }: SparkWalletProps) => {
  const { coins, history, useCoins } = useSparkCoins();
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isUseCoinsOpen, setIsUseCoinsOpen] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [useAmount, setUseAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleAddFunds = async () => {
    const amount = parseInt(addAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Call the actual add funds function passed from parent
      onAddFunds();
      
      // Close the dialog
      setIsAddFundsOpen(false);
      setAddAmount('');
      toast.success(`Added ₹${amount} to your wallet`);
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('Failed to add funds. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleUseCoins = async () => {
    const amount = parseInt(useAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount > coins) {
      toast.error(`Not enough Spark Coins. You have ${coins} coins.`);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const success = await useCoins(amount, 'Payment using Spark Coins');
      
      if (success) {
        // Call the actual use coins function passed from parent
        onUseCoinsPay();
        
        // Close the dialog
        setIsUseCoinsOpen(false);
        setUseAmount('');
        toast.success(`Used ${amount} Spark Coins for payment`);
      }
    } catch (error) {
      console.error('Error using coins:', error);
      toast.error('Failed to use Spark Coins. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <>
      <Card className="neo-card border-white/5 shadow-lg overflow-hidden bg-ev-dark-100">
        <CardHeader className="bg-ev-dark-300/30 pb-4">
          <CardTitle className="text-white flex items-center">
            <Zap className="h-5 w-5 text-ev-green-400 mr-2" />
            Spark Wallet
          </CardTitle>
          <CardDescription className="text-white/60">
            Earn and spend Spark Coins for discounts
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Wallet Balance */}
          <div className="bg-gradient-to-r from-ev-dark-300 to-ev-dark-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white/60 text-sm">Available Balance</p>
                <div className="flex items-center mt-1">
                  <Zap className="h-5 w-5 text-ev-green-400 mr-1" />
                  <span className="text-2xl font-bold text-white">{coins}</span>
                </div>
                <p className="text-white/40 text-xs mt-1">Spark Coins</p>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-white/5 hover:bg-white/10 border-white/10 text-white"
                  onClick={() => setIsAddFundsOpen(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Funds
                </Button>
                
                <Button 
                  size="sm" 
                  className="bg-ev-green-500 hover:bg-ev-green-600 text-white"
                  onClick={() => setIsUseCoinsOpen(true)}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Use Coins
                </Button>
              </div>
            </div>
          </div>
          
          {/* Transactions */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-ev-dark-300/50 w-full mb-4">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="earned" className="flex-1">Earned</TabsTrigger>
              <TabsTrigger value="spent" className="flex-1">Spent</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {history.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {history.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between bg-ev-dark-200/50 p-3 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          transaction.type === 'earned' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {transaction.type === 'earned' ? (
                            <ArrowDown className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowUp className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {transaction.description}
                          </p>
                          <div className="flex items-center text-white/40 text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(transaction.timestamp), 'dd MMM yyyy, HH:mm')}
                          </div>
                        </div>
                      </div>
                      <div className={`font-medium ${
                        transaction.type === 'earned' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'earned' ? '+' : '-'}{Math.abs(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-white/60">
                  <Wallet className="h-8 w-8 mx-auto mb-2 text-white/30" />
                  <p>No transactions yet</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="earned" className="mt-0">
              {history.filter(t => t.type === 'earned').length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {history
                    .filter(transaction => transaction.type === 'earned')
                    .map((transaction) => (
                      <div 
                        key={transaction.id}
                        className="flex items-center justify-between bg-ev-dark-200/50 p-3 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                            <ArrowDown className="h-4 w-4 text-green-500" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {transaction.description}
                            </p>
                            <div className="flex items-center text-white/40 text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(transaction.timestamp), 'dd MMM yyyy, HH:mm')}
                            </div>
                          </div>
                        </div>
                        <div className="text-green-500 font-medium">
                          +{transaction.amount}
                        </div>
                      </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-white/60">
                  <ArrowDown className="h-8 w-8 mx-auto mb-2 text-white/30" />
                  <p>No earnings yet</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="spent" className="mt-0">
              {history.filter(t => t.type === 'spent').length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {history
                    .filter(transaction => transaction.type === 'spent')
                    .map((transaction) => (
                      <div 
                        key={transaction.id}
                        className="flex items-center justify-between bg-ev-dark-200/50 p-3 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mr-3">
                            <ArrowUp className="h-4 w-4 text-red-500" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {transaction.description}
                            </p>
                            <div className="flex items-center text-white/40 text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(transaction.timestamp), 'dd MMM yyyy, HH:mm')}
                            </div>
                          </div>
                        </div>
                        <div className="text-red-500 font-medium">
                          -{Math.abs(transaction.amount)}
                        </div>
                      </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-white/60">
                  <ArrowUp className="h-8 w-8 mx-auto mb-2 text-white/30" />
                  <p>No spending yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="bg-ev-dark-100/30 px-6 py-4 flex flex-col space-y-2">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
              <Zap className="h-4 w-4 text-ev-green-400 mr-1" />
              <span className="text-white/70 text-sm">Conversion Rate:</span>
            </div>
            <span className="text-white text-sm">₹10 = 1 Spark Coin</span>
          </div>
          
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
              <Badge className="bg-ev-green-500/20 text-ev-green-400 hover:bg-ev-green-500/30">TIP</Badge>
            </div>
            <span className="text-white/70 text-xs">Use coins for discounts on charging</span>
          </div>
        </CardFooter>
      </Card>
      
      {/* Add Funds Dialog */}
      <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
        <DialogContent className="bg-ev-dark-100 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Add Funds to Wallet</DialogTitle>
            <DialogDescription className="text-white/60">
              Enter the amount you want to add to your wallet
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="amount" className="text-white/70">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              placeholder="Enter amount"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              className="bg-ev-dark-300 border-white/10 text-white mt-2"
            />
            
            <div className="flex items-center mt-4 bg-ev-dark-300/50 p-3 rounded-lg">
              <Zap className="h-5 w-5 text-ev-green-400 mr-2" />
              <div className="flex-1">
                <p className="text-white text-sm">You'll receive</p>
                <p className="text-white/60 text-xs">at rate of ₹10 = 1 Spark Coin</p>
              </div>
              <div className="text-ev-green-400 font-medium">
                {isNaN(parseInt(addAmount)) ? 0 : Math.floor(parseInt(addAmount) / 10)} Coins
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddFundsOpen(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddFunds}
              disabled={isProcessing}
              className="bg-ev-green-500 hover:bg-ev-green-600 text-white"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Add Funds'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Use Coins Dialog */}
      <Dialog open={isUseCoinsOpen} onOpenChange={setIsUseCoinsOpen}>
        <DialogContent className="bg-ev-dark-100 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Use Spark Coins</DialogTitle>
            <DialogDescription className="text-white/60">
              Enter the number of coins you want to use
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center mb-4 bg-ev-dark-300/50 p-3 rounded-lg">
              <Zap className="h-5 w-5 text-ev-green-400 mr-2" />
              <div className="flex-1">
                <p className="text-white text-sm">Available Balance</p>
              </div>
              <div className="text-white font-medium">
                {coins} Coins
              </div>
            </div>
            
            <Label htmlFor="use-amount" className="text-white/70">Coins to Use</Label>
            <Input
              id="use-amount"
              type="number"
              min="1"
              max={coins}
              placeholder="Enter amount"
              value={useAmount}
              onChange={(e) => setUseAmount(e.target.value)}
              className="bg-ev-dark-300 border-white/10 text-white mt-2"
            />
            
            <div className="flex items-center mt-4 bg-ev-dark-300/50 p-3 rounded-lg">
              <Wallet className="h-5 w-5 text-ev-green-400 mr-2" />
              <div className="flex-1">
                <p className="text-white text-sm">Equivalent Value</p>
              </div>
              <div className="text-ev-green-400 font-medium">
                ₹{isNaN(parseInt(useAmount)) ? 0 : parseInt(useAmount) * 10}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUseCoinsOpen(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUseCoins}
              disabled={isProcessing || isNaN(parseInt(useAmount)) || parseInt(useAmount) <= 0 || parseInt(useAmount) > coins}
              className="bg-ev-green-500 hover:bg-ev-green-600 text-white"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Use Coins'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SparkWallet; 