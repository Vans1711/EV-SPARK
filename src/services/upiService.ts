import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { razorpayService } from './razorpay';
import { paymentService } from './payments';

export interface UpiPaymentData {
  payeeVpa: string;
  payeeName: string;
  amount: number;
  description: string;
  booking_id?: string;
  station_id?: string;
}

export interface UpiTransactionResult {
  success: boolean;
  message: string;
  transactionId?: string;
  paymentId?: string;
  sparkCoinsEarned?: number;
}

export interface UpiVerificationData {
  transactionId: string;
  upiId: string;
  amount: number;
  status: 'success' | 'failure' | 'pending';
}

interface UpiTransactionData {
  transactionId: string;
  upiId: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
}

class UpiService {
  /**
   * Generate a UPI intent URL for payment apps
   */
  generateUpiIntentUrl(data: UpiPaymentData): string {
    const {
      payeeVpa,
      payeeName,
      amount,
      description = 'EV Charging Payment',
      referenceId = `txn_${Date.now()}`
    } = data;

    // Format UPI intent URL
    return `upi://pay?pa=${payeeVpa}&pn=${encodeURIComponent(payeeName)}&am=${amount}&tn=${encodeURIComponent(description)}&tr=${referenceId}&cu=INR`;
  }

  /**
   * Initiate a UPI payment
   */
  async initiateUpiPayment(data: UpiPaymentData): Promise<UpiTransactionResult> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          message: 'User not authenticated'
        };
      }

      // Create payment record
      const { data: payment, error } = await supabase
        .from('payments')
        .insert([{
          user_id: user.id,
          amount: data.amount,
          payment_method: 'upi',
          status: 'pending',
          receiver_vpa: data.payeeVpa,
          receiver_name: data.payeeName,
          description: data.description,
          booking_id: data.booking_id,
          station_id: data.station_id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating payment record:', error);
        return {
          success: false,
          message: 'Failed to create payment record'
        };
      }

      return {
        success: true,
        transactionId: payment.id,
        payment
      };
    } catch (error) {
      console.error('Error initiating UPI payment:', error);
      return {
        success: false,
        message: 'Failed to initiate payment'
      };
    }
  }

  /**
   * Verify a UPI transaction - in a real app, this would call a payment gateway API
   * For this demo, we're mock-verifying the payment
   */
  async verifyUpiTransaction(data: UpiTransactionData): Promise<UpiTransactionResult> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          message: 'User not authenticated'
        };
      }

      // Update payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: data.status,
          transaction_id: data.transactionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.transactionId);

      if (updateError) {
        console.error('Error updating payment status:', updateError);
        return {
          success: false,
          message: 'Failed to update payment status'
        };
      }

      // Calculate spark coins earned (1 coin per ₹10)
      const coinsEarned = Math.floor(data.amount / 10);

      return {
        success: true,
        transactionId: data.transactionId,
        sparkCoinsEarned: coinsEarned
      };
    } catch (error) {
      console.error('Error verifying UPI transaction:', error);
      return {
        success: false,
        message: 'Failed to verify transaction'
      };
    }
  }

  /**
   * Create a QR code containing UPI payment information
   */
  async createQrCodeUrl(data: UpiPaymentData): Promise<string> {
    const upiUrl = this.generateUpiIntentUrl(data);
    
    // In a real app, you might use a server-side API to generate a QR code
    // For this demo, we'll use the client-side QRCode library
    // This function is a placeholder - the actual QR code generation is done in the QRCodeGenerator component
    return upiUrl;
  }
  
  /**
   * Parse a UPI QR code content
   */
  parseUpiQrCode(qrContent: string): {
    payeeVpa?: string;
    payeeName?: string;
    amount?: string;
    referenceId?: string;
    description?: string;
  } | null {
    try {
      // Check if this looks like a UPI URL
      if (qrContent.includes('upi://') || qrContent.includes('pa=')) {
        // Extract query parameters
        const urlParams = new URLSearchParams(qrContent.replace('upi://', '').replace('pay?', ''));
        
        return {
          payeeVpa: urlParams.get('pa') || undefined,
          payeeName: urlParams.get('pn') || undefined,
          amount: urlParams.get('am') || undefined,
          referenceId: urlParams.get('tr') || undefined,
          description: urlParams.get('tn') || undefined
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing UPI QR code:', error);
      return null;
    }
  }

  async getPaymentHistory() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          message: 'User not authenticated'
        };
      }

      // Fetch payment history
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment history:', error);
        return {
          success: false,
          message: 'Failed to fetch payment history'
        };
      }

      return {
        success: true,
        payments
      };
    } catch (error) {
      console.error('Error getting payment history:', error);
      return {
        success: false,
        message: 'Failed to get payment history'
      };
    }
  }
}

export const upiService = new UpiService(); 