import { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      try {
        setIsLoading(true);
        
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (!error) {
            setSession(data.session);
            setUser(data.session?.user || null);
          }
        } catch (error) {
          console.error('Error in auth session:', error);
        }
      } catch (error) {
        console.error('Exception in getSession:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user || null);
      });
      subscription = data.subscription;
    } catch (error) {
      console.error('Error setting up auth subscription:', error);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          toast.success('Signed in successfully');
          return { success: true };
        }
      } catch (error) {
        console.error('Error during sign in:', error);
      }

      return { success: false, error: 'Unknown error occurred' };
    } catch (error: any) {
      console.error('Exception during sign in:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      try {
        // Create auth user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          try {
            // Create user profile in users table immediately
            await supabase.from('users').insert([
              {
                id: data.user.id,
                email: data.user.email,
                name: name,
                spark_coins: 100, // Start with 100 spark coins
                created_at: new Date().toISOString(),
              },
            ]);
            
            // Set the user state immediately
            setUser(data.user);
            setSession(data.session);
            
          } catch (profileError) {
            console.error('Error creating user profile:', profileError);
          }

          toast.success('Account created successfully');
          return { success: true };
        }
      } catch (error) {
        console.error('Error during sign up:', error);
      }

      return { success: false, error: 'Unknown error occurred' };
    } catch (error: any) {
      console.error('Exception during sign up:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      try {
        await supabase.auth.signOut();
        toast.success('Signed out successfully');
      } catch (error) {
        console.error('Error signing out:', error);
        toast.error('Error signing out. Please try again.');
      }
    } catch (error) {
      console.error('Exception during sign out:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 