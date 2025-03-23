import { supabase } from '../lib/supabase';
import type { ChargingStation } from '../lib/supabase';

export interface StationFilters {
  search?: string;
  priceRange?: [number, number];
  availableOnly?: boolean;
  vehicleTypes?: string[];
  chargingSpeeds?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
}

export const chargingStationService = {
  async getStations(filters?: StationFilters) {
    let query = supabase
      .from('charging_stations')
      .select('*');
    
    if (filters) {
      // Apply search filter
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      // Apply price range filter
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        query = query.gte('price_per_kwh', min).lte('price_per_kwh', max);
      }
      
      // Apply availability filter
      if (filters.availableOnly) {
        query = query.eq('available', true);
      }
      
      // Apply vehicle type filter
      if (filters.vehicleTypes && filters.vehicleTypes.length > 0) {
        query = query.contains('vehicle_types', filters.vehicleTypes);
      }
      
      // Apply charging speed filter
      if (filters.chargingSpeeds && filters.chargingSpeeds.length > 0) {
        query = query.contains('charging_speeds', filters.chargingSpeeds);
      }
      
      // Apply location-based filter using PostGIS
      if (filters.latitude && filters.longitude && filters.radius) {
        // This uses the nearby_stations function defined in our SQL migration
        query = query.rpc('nearby_stations', {
          lat: filters.latitude,
          long: filters.longitude,
          radius_km: filters.radius
        });
      }
    }
    
    const { data, error } = await query;
    return { stations: data as ChargingStation[], error };
  },
  
  async getStationById(id: string) {
    const { data, error } = await supabase
      .from('charging_stations')
      .select('*')
      .eq('id', id)
      .single();
      
    return { station: data as ChargingStation, error };
  },
  
  async createStation(station: Omit<ChargingStation, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('charging_stations')
      .insert([station])
      .select()
      .single();
      
    return { station: data as ChargingStation, error };
  },
  
  async updateStation(id: string, updates: Partial<ChargingStation>) {
    const { data, error } = await supabase
      .from('charging_stations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    return { station: data as ChargingStation, error };
  },
  
  async deleteStation(id: string) {
    const { error } = await supabase
      .from('charging_stations')
      .delete()
      .eq('id', id);
      
    return { error };
  }
}; 