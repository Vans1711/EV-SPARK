import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type User = {
  id: string;
  email: string;
  name: string;
  profile_image?: string;
  spark_coins: number;
  created_at: string;
};

export type ChargingStation = {
  id: string;
  name: string;
  description?: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  price_per_kwh: number;
  available: boolean;
  vehicle_types?: string[];
  charging_speeds?: string[];
  amenities?: string[];
  operator?: string;
  capacity?: string;
  power?: string;
  created_at: string;
};

export type Booking = {
  id: string;
  user_id: string;
  station_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  energy_used?: number;
  created_at: string;
};

export type Payment = {
  id: string;
  user_id: string;
  booking_id: string;
  amount: number;
  currency: string;
  payment_method: 'card' | 'upi' | 'wallet' | 'mobile';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transaction_id?: string;
  payment_gateway: string;
  spark_coins_earned: number;
  created_at: string;
};

// Helper function to determine if an error is related to connection issues
export const isConnectionError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const connectionErrorTerms = [
    'network error',
    'failed to fetch',
    'network request failed',
    'connection',
    'connect',
    'offline',
    'timeout',
    'aborted',
    'internet'
  ];
  
  return connectionErrorTerms.some(term => errorMessage.includes(term));
};

// Helper function to handle API errors consistently
export const handleApiError = (error: any, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (isConnectionError(error)) {
    return {
      message: 'Failed to connect to the database. Please check your internet connection and try again later.',
      isConnectionError: true
    };
  }
  
  return {
    message: error?.message || error?.error_description || defaultMessage,
    isConnectionError: false
  };
};

// Method to test connection with supabase
export const testConnection = async () => {
  try {
    // Try to fetch one row from any table to test connection
    const { error } = await supabase.from('health_check').select('*').limit(1).maybeSingle();
    
    // For tables that don't exist, this will still indicate if the connection works
    if (error && error.code !== 'PGRST116') { // PGRST116 is "table does not exist" which is fine
      console.error('Database connection test failed:', error);
      
      // Check if it's a connection error
      if (isConnectionError(error)) {
        return false;
      }
      
      // For table not found or permissions errors, connection is still working
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Database connection test failed with exception:', error);
    return false;
  }
};

// Export the original client as default for backward compatibility
export default supabase; 