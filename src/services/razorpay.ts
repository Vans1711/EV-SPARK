// This is a mock Razorpay integration service for demonstration purposes
// In a real application, you would use the actual Razorpay SDK

export interface RazorpayOptions {
  key: string;
  amount: number; // amount in currency subunits (paise for INR)
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// In a real app, you would use the Razorpay script
// This is a mock implementation for demonstration
export const initRazorpay = (): Promise<any> => {
  return new Promise((resolve) => {
    // Simulate loading the Razorpay script
    console.log('Loading Razorpay...');
    
    // Mock Razorpay object
    const mockRazorpay = {
      open: (options: RazorpayOptions) => {
        console.log('Opening Razorpay payment modal with options:', options);
        
        // Simulate successful payment after a short delay
        setTimeout(() => {
          if (options.handler) {
            const mockResponse: RazorpayResponse = {
              razorpay_payment_id: `pay_${Math.random().toString(36).substring(2, 15)}`,
              razorpay_order_id: options.order_id,
              razorpay_signature: `sign_${Math.random().toString(36).substring(2, 15)}`
            };
            
            options.handler(mockResponse);
          }
        }, 2000);
      }
    };
    
    resolve(mockRazorpay);
  });
};

export const razorpayService = {
  async createOrder(amount: number, currency: string = 'INR', receipt: string) {
    // In a real app, you would make an API call to your backend
    // which would then call Razorpay's create order API
    
    // Mock response
    return {
      id: `order_${Math.random().toString(36).substring(2, 15)}`,
      entity: 'order',
      amount: amount,
      amount_paid: 0,
      amount_due: amount,
      currency: currency,
      receipt: receipt,
      status: 'created',
      created_at: Date.now()
    };
  },
  
  async verifyPayment(paymentId: string, orderId: string, signature: string) {
    // In a real app, this verification would happen on your backend
    // to prevent tampering with the payment verification
    
    // Mock response - always returns success for demo
    return {
      success: true
    };
  }
}; 