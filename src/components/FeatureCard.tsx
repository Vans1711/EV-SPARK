
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CSSProperties } from 'react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  iconColor?: string;
  hoverEffect?: boolean;
  style?: CSSProperties;
}

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className,
  iconColor = "text-ev-green-400",
  hoverEffect = true,
  style
}: FeatureCardProps) => {
  return (
    <div 
      className={cn(
        "neo-card rounded-2xl p-6 transition-all duration-300",
        hoverEffect && "hover:translate-y-[-4px] hover:shadow-lg",
        className
      )}
      style={style}
    >
      <div className="flex flex-col space-y-4">
        <div className={cn("rounded-lg inline-flex p-3 bg-white/5", iconColor)}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-white/60">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
