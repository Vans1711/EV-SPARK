import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    agreeTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast.error("You must agree to our terms of service to create an account.");
      return;
    }
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill out all required fields.");
      return;
    }
    
    // Use AuthContext to sign up
    const result = await signUp(formData.email, formData.password, formData.name);
    
    if (result.success) {
      // Navigate to profile immediately after successful signup
      navigate('/profile');
    } else {
      // Show error message
      toast.error(result.error || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ev-dark-200">
      <div className="fixed top-6 left-6 z-10">
        <Link to="/" className="flex items-center space-x-2 group">
          <Zap className="h-7 w-7 text-ev-green-400" />
          <span className="text-xl font-bold tracking-tight text-white">
            EV <span className="text-ev-green-400">Spark</span>
          </span>
        </Link>
      </div>
      
      <div className="flex flex-grow items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="neo-card rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
              <p className="text-white/60 mt-2">Join the EV Spark community today</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-white text-sm">Full Name</label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  className="bg-ev-dark-100 border-white/10 text-white"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-white text-sm">Email Address</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="bg-ev-dark-100 border-white/10 text-white"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-white text-sm">Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="bg-ev-dark-100 border-white/10 text-white pr-10"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-white/40 text-xs mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, agreeTerms: checked as boolean }))
                  }
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-white/70 cursor-pointer"
                >
                  I agree to the{" "}
                  <Link to="/terms" className="text-ev-green-400 hover:underline">
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-ev-green-400 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-ev-green-500 hover:bg-ev-green-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              
              <p className="text-center text-white/60 text-sm mt-6">
                Already have an account?{" "}
                <Link to="/signin" className="text-ev-green-400 hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
