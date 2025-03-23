import { Loader2 } from 'lucide-react';

interface LoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Loader = ({ text = 'Loading...', size = 'md' }: LoaderProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className={`animate-spin text-ev-green-400 ${sizeClasses[size]}`} />
      <p className="text-white/70">{text}</p>
    </div>
  );
};

export default Loader; 