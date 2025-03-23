import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSparkCoins } from '@/context/SparkCoinsContext';
import { useAuth } from '@/context/AuthContext';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const { addCoins } = useSparkCoins();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    const result = await signIn(email, password);
    
    if (result.success) {
      // Demo login reward
      addCoins(25, 'Daily login reward');
      
      // Navigate to profile after successful login
      navigate('/profile');
    } else {
      toast.error(result.error || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-ev-dark-200 text-white">
      <Navbar />
      
      <main className="py-24 px-6 md:px-8 lg:px-12 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-0 top-1/4 w-72 h-72 bg-ev-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute left-1/4 bottom-1/4 w-96 h-96 bg-ev-green-500/10 rounded-full blur-3xl" />
        </div>
        
        <Card className="w-full max-w-md neo-card border-white/5 bg-ev-dark-100/40 backdrop-blur-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-ev-dark-300 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-ev-green-400" />
            </div>
            <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
            <CardDescription className="text-white/60">
              Sign in to your EV Spark account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-ev-dark-300/50 border-white/10 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Link to="/reset-password" className="text-sm text-ev-green-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-ev-dark-300/50 border-white/10 text-white"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex h-5 items-center space-x-2">
                  <div className="h-4 w-4 rounded-sm border border-white/20 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-sm bg-ev-green-400"></div>
                  </div>
                </div>
                <label htmlFor="remember" className="text-sm font-medium leading-none text-white/70">
                  Remember me
                </label>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-ev-green-500 hover:bg-ev-green-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
          
          <div className="mt-4 px-8 pb-8 text-center text-sm">
            <div className="text-white/60">
              Don't have an account?{' '}
              <Link to="/signup" className="text-ev-green-400 hover:underline">
                Sign up
              </Link>
            </div>
            <div className="mt-2 text-white/60">
              <span className="inline-flex items-center">
                <Zap className="h-4 w-4 text-ev-green-400 mr-1" />
                Earn 25 Spark Coins when you sign in today!
              </span>
            </div>
          </div>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignIn;
