import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

const SupabaseTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { user } = await authService.getCurrentUser();
      setUser(user);
      setLoading(false);
    };
    
    checkUser();
    
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    try {
      setLoading(true);
      const { error } = await authService.signUp({ email, password, name });
      
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Signup successful! Check your email for confirmation.');
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    try {
      setLoading(true);
      const { error } = await authService.login({ email, password });
      
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Login successful!');
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setMessage('');
    
    try {
      setLoading(true);
      const { error } = await authService.logout();
      
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Logout successful!');
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Auth Test</CardTitle>
          <CardDescription>Test your Supabase authentication</CardDescription>
        </CardHeader>
        <CardContent>
          {message && <div className="bg-blue-100 p-2 mb-4 rounded">{message}</div>}
          
          {user ? (
            <div>
              <h2 className="text-xl font-bold mb-2">Logged in as:</h2>
              <pre className="bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          ) : (
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Password"
                />
              </div>
              
              {!user && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name (for signup)</Label>
                  <Input 
                    id="name"
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Your name"
                  />
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button type="button" onClick={handleLogin}>Login</Button>
                <Button type="button" variant="outline" onClick={handleSignUp}>Sign Up</Button>
              </div>
            </form>
          )}
        </CardContent>
        
        {user && (
          <CardFooter>
            <Button variant="destructive" onClick={handleLogout}>Logout</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default SupabaseTest; 