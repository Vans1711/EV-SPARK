import { supabase } from '@/lib/supabase';

// Sample charging stations data for India
const sampleStations = [
  {
    name: 'Greencharge Hub - Delhi',
    description: 'Fast charging station with 24/7 availability and amenities',
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139] // Delhi
    },
    address: 'Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    postal_code: '110001',
    price_per_kwh: 12.50,
    available: true,
    vehicle_types: ['2W', '4W'],
    charging_speeds: ['Fast', 'Normal'],
    amenities: ['Cafeteria', 'Restroom', 'Wifi']
  },
  {
    name: 'EV Power Station - Mumbai',
    description: 'Premium charging facility near city center',
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // Mumbai
    },
    address: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    postal_code: '400050',
    price_per_kwh: 14.75,
    available: true,
    vehicle_types: ['2W', '3W', '4W'],
    charging_speeds: ['Fast'],
    amenities: ['Shopping', 'Restroom', 'Wifi', 'Service Center']
  },
  {
    name: 'Spark Charging Point - Bangalore',
    description: 'Eco-friendly charging station powered by solar energy',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716] // Bangalore
    },
    address: 'MG Road',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    postal_code: '560001',
    price_per_kwh: 11.25,
    available: true,
    vehicle_types: ['2W', '4W', 'Heavy'],
    charging_speeds: ['Fast', 'Normal', 'Slow'],
    amenities: ['Cafeteria', 'Restroom', 'Wifi', 'Lounge']
  },
  {
    name: 'Urban EV Spot - Hyderabad',
    description: 'Centrally located with multiple charging ports',
    location: {
      type: 'Point',
      coordinates: [78.4867, 17.3850] // Hyderabad
    },
    address: 'Jubilee Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    postal_code: '500033',
    price_per_kwh: 13.00,
    available: false, // Currently under maintenance
    vehicle_types: ['2W', '3W', '4W'],
    charging_speeds: ['Fast', 'Normal'],
    amenities: ['Restroom', 'Wifi']
  },
  {
    name: 'Highway Charge Station - Chennai',
    description: 'Convenient location for highway travelers',
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827] // Chennai
    },
    address: 'OMR Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    postal_code: '600119',
    price_per_kwh: 10.50,
    available: true,
    vehicle_types: ['2W', '3W', '4W', 'Heavy'],
    charging_speeds: ['Fast'],
    amenities: ['Restaurant', 'Restroom', 'Service Center']
  },
  {
    name: 'Zap & Go - Kolkata',
    description: 'Quick charging solutions in the heart of the city',
    location: {
      type: 'Point',
      coordinates: [88.3639, 22.5726] // Kolkata
    },
    address: 'Park Street',
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    postal_code: '700016',
    price_per_kwh: 12.00,
    available: true,
    vehicle_types: ['2W', '4W'],
    charging_speeds: ['Fast', 'Normal'],
    amenities: ['Cafeteria', 'Wifi']
  },
  {
    name: 'Electrify Hub - Pune',
    description: 'Modern charging facility with smart charge monitoring',
    location: {
      type: 'Point',
      coordinates: [73.8567, 18.5204] // Pune
    },
    address: 'Koregaon Park',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    postal_code: '411001',
    price_per_kwh: 12.25,
    available: true,
    vehicle_types: ['2W', '3W', '4W'],
    charging_speeds: ['Fast', 'Slow'],
    amenities: ['Shopping', 'Restroom', 'Wifi']
  },
  {
    name: 'Green Circuit - Jaipur',
    description: 'Eco-conscious charging station with solar panels',
    location: {
      type: 'Point',
      coordinates: [75.7873, 26.9124] // Jaipur
    },
    address: 'C-Scheme',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    postal_code: '302001',
    price_per_kwh: 11.75,
    available: true,
    vehicle_types: ['2W', '4W'],
    charging_speeds: ['Normal', 'Slow'],
    amenities: ['Cafeteria', 'Restroom', 'Wifi']
  },
  {
    name: 'Volt Valley - Ahmedabad',
    description: 'Charging station with premium amenities',
    location: {
      type: 'Point',
      coordinates: [72.5714, 23.0225] // Ahmedabad
    },
    address: 'SG Highway',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    postal_code: '380054',
    price_per_kwh: 11.00,
    available: false, // Temporarily closed
    vehicle_types: ['2W', '3W', '4W', 'Heavy'],
    charging_speeds: ['Fast', 'Normal'],
    amenities: ['Restaurant', 'Shopping', 'Lounge']
  },
  {
    name: 'Power Point - Chandigarh',
    description: 'Reliable charging station with battery swap facility',
    location: {
      type: 'Point',
      coordinates: [76.7794, 30.7333] // Chandigarh
    },
    address: 'Sector 17',
    city: 'Chandigarh',
    state: 'Punjab',
    country: 'India',
    postal_code: '160017',
    price_per_kwh: 10.75,
    available: true,
    vehicle_types: ['2W', '3W', '4W'],
    charging_speeds: ['Fast', 'Normal'],
    amenities: ['Cafeteria', 'Restroom', 'Wifi', 'Battery Swap']
  }
];

export async function populateSampleStations() {
  try {
    const { data, error } = await supabase
      .from('charging_stations')
      .insert(sampleStations);
      
    if (error) {
      console.error('Error inserting sample data:', error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Sample stations added successfully' };
  } catch (err) {
    console.error('Exception while adding sample data:', err);
    return { success: false, message: String(err) };
  }
}

export async function checkIfStationsExist() {
  try {
    const { count, error } = await supabase
      .from('charging_stations')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error('Error checking stations:', error);
      return false;
    }
    
    return (count && count > 0) ? true : false;
  } catch (err) {
    console.error('Exception while checking stations:', err);
    return false;
  }
} 