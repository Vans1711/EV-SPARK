
import { Zap } from 'lucide-react';
import { useSparkCoins } from '@/context/SparkCoinsContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SparkCoinsIndicatorProps {
  className?: string;
}

const SparkCoinsIndicator = ({ className }: SparkCoinsIndicatorProps) => {
  const { coins } = useSparkCoins();

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 border-white/10 bg-ev-dark-300/50 hover:bg-ev-dark-300/80 cursor-pointer group transition-all", 
        className
      )}
    >
      <Zap className="h-3.5 w-3.5 text-ev-green-400 group-hover:animate-pulse" />
      <span className="text-white font-medium">{coins}</span>
    </Badge>
  );
};

export default SparkCoinsIndicator;
