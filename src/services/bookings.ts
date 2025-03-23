import { supabase } from '../lib/supabase';
import type { Booking } from '../lib/supabase';

export interface CreateBookingData {
  station_id: string;
  start_time: string;
  end_time: string;
}

export interface BookingFilters {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
}

export const bookingService = {
  async createBooking(bookingData: CreateBookingData) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { booking: null, error: new Error('User not authenticated') };
    }
    
    const newBooking = {
      user_id: user.id,
      station_id: bookingData.station_id,
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
      status: 'pending' as const
    };
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([newBooking])
      .select()
      .single();
    
    return { booking: data as Booking, error };
  },
  
  async getUserBookings(filters?: BookingFilters) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { bookings: [], error: new Error('User not authenticated') };
    }
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        charging_stations:station_id (
          id,
          name,
          location,
          price_per_kwh
        )
      `)
      .eq('user_id', user.id);
    
    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.startDate) {
        query = query.gte('start_time', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('end_time', filters.endDate);
      }
    }
    
    // Order by start time, most recent first
    query = query.order('start_time', { ascending: false });
    
    const { data, error } = await query;
    return { bookings: data as (Booking & { charging_stations: any })[], error };
  },
  
  async getBookingById(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { booking: null, error: new Error('User not authenticated') };
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        charging_stations:station_id (
          id,
          name,
          location,
          price_per_kwh
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)  // Ensure the booking belongs to the current user
      .single();
    
    return { booking: data as (Booking & { charging_stations: any }), error };
  },
  
  async updateBookingStatus(id: string, status: Booking['status']) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { booking: null, error: new Error('User not authenticated') };
    }
    
    // First check if the booking belongs to the current user
    const { data: bookingCheck } = await supabase
      .from('bookings')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (!bookingCheck || bookingCheck.user_id !== user.id) {
      return { booking: null, error: new Error('Not authorized to update this booking') };
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    return { booking: data as Booking, error };
  },
  
  async cancelBooking(id: string) {
    return this.updateBookingStatus(id, 'cancelled');
  }
}; 