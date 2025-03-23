import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface SparkCoinsContextType {
  coins: number;
  addCoins: (amount: number, description?: string) => void;
  useCoins: (amount: number, description?: string) => boolean;
  history: CoinTransaction[];
  resetCoins: () => void;
}

interface CoinTransaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  description: string;
  timestamp: Date;
}

const SparkCoinsContext = createContext<SparkCoinsContextType | undefined>(undefined);

export const useSparkCoins = () => {
  const context = useContext(SparkCoinsContext);
  if (context === undefined) {
    throw new Error('useSparkCoins must be used within a SparkCoinsProvider');
  }
  return context;
};

interface SparkCoinsProviderProps {
  children: ReactNode;
}

export const SparkCoinsProvider = ({ children }: SparkCoinsProviderProps) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  
  const [coins, setCoins] = useState<number>(() => {
    const savedCoins = localStorage.getItem(`sparkCoins_${userId}`);
    return savedCoins ? JSON.parse(savedCoins) : 100; // Start with 100 coins
  });
  
  const [history, setHistory] = useState<CoinTransaction[]>(() => {
    const savedHistory = localStorage.getItem(`coinHistory_${userId}`);
    return savedHistory ? JSON.parse(savedHistory) : [
      {
        id: '1',
        amount: 100,
        type: 'earned',
        description: 'Welcome bonus',
        timestamp: new Date().toISOString()
      }
    ];
  });

  // Reset state when user changes
  useEffect(() => {
    const savedCoins = localStorage.getItem(`sparkCoins_${userId}`);
    const coins = savedCoins ? JSON.parse(savedCoins) : 100;
    setCoins(coins);
    
    const savedHistory = localStorage.getItem(`coinHistory_${userId}`);
    const history = savedHistory ? JSON.parse(savedHistory) : [
      {
        id: '1',
        amount: 100,
        type: 'earned',
        description: 'Welcome bonus',
        timestamp: new Date().toISOString()
      }
    ];
    setHistory(history);
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(`sparkCoins_${userId}`, JSON.stringify(coins));
  }, [coins, userId]);

  useEffect(() => {
    localStorage.setItem(`coinHistory_${userId}`, JSON.stringify(history));
  }, [history, userId]);

  const resetCoins = () => {
    setCoins(100);
    setHistory([
      {
        id: '1',
        amount: 100,
        type: 'earned',
        description: 'Welcome bonus',
        timestamp: new Date()
      }
    ]);
    toast.success('Spark Coins reset to 100');
  };

  const addCoins = (amount: number, description = 'Coins earned') => {
    setCoins(prevCoins => prevCoins + amount);
    
    const transaction: CoinTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      type: 'earned',
      description,
      timestamp: new Date()
    };
    
    setHistory(prevHistory => [transaction, ...prevHistory]);
    toast.success(`You earned ${amount} Spark Coins! (${description})`);
  };

  const useCoins = (amount: number, description = 'Coins spent') => {
    if (coins < amount) {
      toast.error(`Not enough Spark Coins. You need ${amount} coins but have ${coins}.`);
      return false;
    }
    
    setCoins(prevCoins => prevCoins - amount);
    
    const transaction: CoinTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount: -amount,
      type: 'spent',
      description,
      timestamp: new Date()
    };
    
    setHistory(prevHistory => [transaction, ...prevHistory]);
    toast.success(`You spent ${amount} Spark Coins. (${description})`);
    return true;
  };

  return (
    <SparkCoinsContext.Provider value={{ coins, addCoins, useCoins, history, resetCoins }}>
      {children}
    </SparkCoinsContext.Provider>
  );
};
