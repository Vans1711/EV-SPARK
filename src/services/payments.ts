import { supabase } from '../lib/supabase';
import type { Payment } from '../lib/supabase';

export interface PaymentData {
  booking_id: string;
  amount: number;
  currency: string;
  payment_method: 'card' | 'upi' | 'wallet' | 'mobile';
  payment_details?: {
    card_number?: string;
    card_holder?: string;
    expiry_date?: string;
    upi_id?: string;
    wallet_id?: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  payment?: Payment;
  spark_coins_earned?: number;
  transaction_id?: string;
}

// Helper to calculate Spark Coins earned (10% of amount spent)
const calculateSparkCoins = (amount: number): number => {
  return Math.floor(amount / 10);
};

export const paymentService = {
  async processPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }
      
      // 1. Check if the booking exists and belongs to the user
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', paymentData.booking_id)
        .eq('user_id', user.id)
        .single();
      
      if (bookingError || !booking) {
        return { success: false, message: 'Booking not found or not authorized' };
      }
      
      // 2. Generate a transaction ID (usually provided by payment gateway)
      const transaction_id = `txn_${Math.random().toString(36).substring(2, 15)}`;
      
      // 3. Calculate Spark Coins to be awarded (10% of payment amount)
      const spark_coins_earned = calculateSparkCoins(paymentData.amount);
      
      // 4. Create the payment record
      const paymentRecord = {
        user_id: user.id,
        booking_id: paymentData.booking_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_method: paymentData.payment_method,
        status: 'completed' as const, // Mock payment is always successful
        transaction_id: transaction_id,
        payment_gateway: 'mock_gateway', // In a real implementation, this would be the actual gateway
        spark_coins_earned: spark_coins_earned
      };
      
      // 5. Insert the payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([paymentRecord])
        .select()
        .single();
      
      if (paymentError) {
        console.error('Payment error:', paymentError);
        return { success: false, message: 'Failed to process payment' };
      }
      
      // 6. Update the booking status to "confirmed"
      await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', paymentData.booking_id);
      
      // 7. Update user's spark coins
      const { data: userData } = await supabase
        .from('users')
        .select('spark_coins')
        .eq('id', user.id)
        .single();
      
      const currentSparkCoins = userData?.spark_coins || 0;
      
      await supabase
        .from('users')
        .update({ spark_coins: currentSparkCoins + spark_coins_earned })
        .eq('id', user.id);
      
      return {
        success: true,
        message: 'Payment processed successfully',
        payment: payment as Payment,
        spark_coins_earned,
        transaction_id
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      return { success: false, message: 'An unexpected error occurred' };
    }
  },
  
  async getUserPaymentHistory() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { payments: [], error: new Error('User not authenticated') };
    }
    
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        bookings:booking_id (
          *,
          charging_stations:station_id (
            id,
            name,
            location,
            price_per_kwh
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    return { payments: data as (Payment & { bookings: any })[], error };
  },
  
  async getSparkCoins() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { spark_coins: 0, error: new Error('User not authenticated') };
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('spark_coins')
      .eq('id', user.id)
      .single();
    
    return { spark_coins: data?.spark_coins || 0, error };
  }
}; 