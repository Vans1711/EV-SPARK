import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Mock data for offline fallback
const MOCK_STATIONS: ChargingStation[] = [
  {
    id: 'mock-1',
    name: 'EV Charging Hub - Connaught Place',
    address: '22, Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    postal_code: '110001',
    country: 'India',
    latitude: 28.6315,
    longitude: 77.2167,
    price_per_kwh: 12,
    available: true,
    power_kw: 50,
    connector_types: ['Type 2', 'CCS'],
    operator: 'Tata Power',
    distance_km: 0.5,
    last_updated: new Date().toISOString()
  },
  {
    id: 'mock-2',
    name: 'Green Charge Station - Lajpat Nagar',
    address: 'Lajpat Nagar Market',
    city: 'New Delhi',
    state: 'Delhi',
    postal_code: '110024',
    country: 'India',
    latitude: 28.5710,
    longitude: 77.2434,
    price_per_kwh: 13,
    available: true,
    power_kw: 22,
    connector_types: ['Type 2', 'CHAdeMO'],
    operator: 'Green Charge',
    distance_km: 3.2,
    last_updated: new Date().toISOString()
  },
  {
    id: 'mock-3',
    name: 'FastCharge - Gurugram',
    address: 'Cyber Hub, DLF Phase 2',
    city: 'Gurugram',
    state: 'Haryana',
    postal_code: '122002',
    country: 'India',
    latitude: 28.4961,
    longitude: 77.0902,
    price_per_kwh: 15,
    available: false,
    power_kw: 150,
    connector_types: ['CCS', 'CHAdeMO'],
    operator: 'FastCharge',
    distance_km: 8.7,
    last_updated: new Date().toISOString()
  },
  {
    id: 'mock-4',
    name: 'Ather Grid - South Extension',
    address: 'South Extension Market',
    city: 'New Delhi',
    state: 'Delhi',
    postal_code: '110049',
    country: 'India',
    latitude: 28.5723,
    longitude: 77.2254,
    price_per_kwh: 10,
    available: true,
    power_kw: 7.4,
    connector_types: ['Type 1'],
    operator: 'Ather Energy',
    distance_km: 5.1,
    last_updated: new Date().toISOString()
  },
  {
    id: 'mock-5',
    name: 'EV Charging Zone - Noida',
    address: 'Sector 18 Market',
    city: 'Noida',
    state: 'Uttar Pradesh',
    postal_code: '201301',
    country: 'India',
    latitude: 28.5697,
    longitude: 77.3214,
    price_per_kwh: 11,
    available: true,
    power_kw: 22,
    connector_types: ['Type 2'],
    operator: 'NTPC',
    distance_km: 14.3,
    last_updated: new Date().toISOString()
  }
];

// Interface for Open Charge Map API response
interface OpenChargeMapStation {
  ID: number;
  AddressInfo: {
    ID: number;
    Title: string;
    AddressLine1: string;
    Town: string;
    StateOrProvince: string;
    Postcode: string;
    CountryID: number;
    Country: {
      ID: number;
      Title: string;
      ISOCode: string;
    };
    Latitude: number;
    Longitude: number;
    Distance: number;
    DistanceUnit: number;
  };
  Connections: Array<{
    ConnectionType: {
      ID: number;
      Title: string;
    };
    PowerKW: number;
    CurrentType: {
      Description: string;
    };
    StatusType?: {
      Title: string;
    };
  }>;
  StatusType?: {
    ID: number;
    Title: string;
    IsOperational: boolean;
  };
  DateLastStatusUpdate: string;
  UsageCost?: string;
  OperatorInfo?: {
    Title: string;
  };
}

// Our application's station format
export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  price_per_kwh: number;
  available: boolean;
  power_kw: number;
  connector_types: string[];
  operator: string;
  distance_km: number;
  last_updated: string;
}

class StationService {
  // Fetch real-time charging stations near a location
  async getNearbyStations(latitude: number, longitude: number, radius: number = 20): Promise<ChargingStation[]> {
    try {
      // Check if we're online
      if (!window.navigator.onLine) {
        console.log('Device is offline. Using mock data.');
        return this.getMockStationsWithDistance(latitude, longitude);
      }

      // Use Open Charge Map API to get real charging stations
      const response = await fetch(
        `https://api.openchargemap.io/v3/poi/?output=json&countrycode=IN&latitude=${latitude}&longitude=${longitude}&distance=${radius}&distanceunit=KM&maxresults=50&compact=true&verbose=false&key=${import.meta.env.VITE_OPEN_CHARGE_MAP_API_KEY || 'e9edfcff-9e0b-4bd5-9e3d-1f4b921bd472'}`
      );
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data: OpenChargeMapStation[] = await response.json();
      
      // Transform API data to our application format
      return data.map(station => this.transformStation(station)).sort((a, b) => a.distance_km - b.distance_km);
    } catch (error) {
      console.error('Error fetching nearby stations:', error);
      
      // Try getting stations from database
      const dbStations = await this.getFallbackStations(latitude, longitude);
      
      // If we have database stations, use them
      if (dbStations && dbStations.length > 0) {
        console.log('Using database stations as fallback');
        return dbStations;
      }
      
      // Otherwise use mock data as final fallback
      console.log('Using mock stations as fallback');
      return this.getMockStationsWithDistance(latitude, longitude);
    }
  }
  
  // Transform Open Charge Map station to our format
  private transformStation(station: OpenChargeMapStation): ChargingStation {
    const connectorTypes = station.Connections?.map(c => c.ConnectionType.Title) || ['Type 2'];
    const powerKw = station.Connections?.reduce((max, c) => Math.max(max, c.PowerKW || 0), 0) || 7.4;
    
    // Calculate an approximate price per kWh (actual prices not always available in the API)
    const pricePerKwh = Math.round(10 + Math.random() * 5); // Between 10-15 INR/kWh
    
    return {
      id: `ocm-${station.ID}`,
      name: station.AddressInfo.Title,
      address: station.AddressInfo.AddressLine1,
      city: station.AddressInfo.Town || station.AddressInfo.StateOrProvince,
      state: station.AddressInfo.StateOrProvince,
      postal_code: station.AddressInfo.Postcode,
      country: station.AddressInfo.Country.Title,
      latitude: station.AddressInfo.Latitude,
      longitude: station.AddressInfo.Longitude,
      price_per_kwh: pricePerKwh,
      available: station.StatusType?.IsOperational !== false,
      power_kw: powerKw,
      connector_types: connectorTypes,
      operator: station.OperatorInfo?.Title || 'Independent Operator',
      distance_km: station.AddressInfo.Distance,
      last_updated: station.DateLastStatusUpdate || new Date().toISOString()
    };
  }
  
  // Get mock stations with calculated distances
  private getMockStationsWithDistance(userLat: number, userLon: number): ChargingStation[] {
    return MOCK_STATIONS.map(station => {
      const distance = this.calculateDistance(
        userLat,
        userLon,
        station.latitude,
        station.longitude
      );
      
      return {
        ...station,
        distance_km: distance
      };
    }).sort((a, b) => a.distance_km - b.distance_km);
  }
  
  // Fallback method to calculate distances for stations in the database
  private async getFallbackStations(userLat: number, userLon: number): Promise<ChargingStation[]> {
    try {
      const { data, error } = await supabase
        .from('charging_stations')
        .select('*');
        
      if (error) throw error;
      
      return data.map(station => {
        // Calculate distance using Haversine formula
        const distance = this.calculateDistance(
          userLat, 
          userLon, 
          station.latitude, 
          station.longitude
        );
        
        return {
          ...station,
          distance_km: distance
        };
      }).sort((a, b) => a.distance_km - b.distance_km);
    } catch (error) {
      console.error('Error fetching fallback stations:', error);
      return [];
    }
  }
  
  // Calculate distance between two coordinates using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return parseFloat((R * c).toFixed(1));
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  // Get a single station by ID
  async getStationById(id: string): Promise<ChargingStation | null> {
    try {
      // Check if we're online
      if (!window.navigator.onLine) {
        console.log('Device is offline. Using mock data for station details.');
        const mockStation = MOCK_STATIONS.find(s => s.id === id);
        if (mockStation) return mockStation;
        return MOCK_STATIONS[0]; // Return first mock station as fallback
      }

      if (id.startsWith('ocm-')) {
        // It's an Open Charge Map station
        try {
          const stationId = id.replace('ocm-', '');
          const response = await fetch(
            `https://api.openchargemap.io/v3/poi/${stationId}?key=${import.meta.env.VITE_OPEN_CHARGE_MAP_API_KEY || 'e9edfcff-9e0b-4bd5-9e3d-1f4b921bd472'}`
          );
          
          if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
          }
          
          const data: OpenChargeMapStation[] = await response.json();
          if (data.length > 0) {
            return this.transformStation(data[0]);
          }
        } catch (error) {
          console.error('Error fetching OCM station:', error);
          // Continue to fallbacks
        }
      } 
      
      // Try to get from database
      try {
        const { data, error } = await supabase
          .from('charging_stations')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        if (data) return data;
      } catch (dbError) {
        console.error('Error fetching from database:', dbError);
        // Continue to fallbacks
      }
      
      // Return mock data as final fallback
      const mockStation = MOCK_STATIONS.find(s => s.id === 'mock-1');
      return mockStation || null;
    } catch (error) {
      console.error('Error fetching station:', error);
      return MOCK_STATIONS[0]; // Return first mock station as fallback
    }
  }
}

export const stationService = new StationService(); 