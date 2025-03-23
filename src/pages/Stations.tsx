import { useState, useEffect } from 'react';
import { Search, Battery, Zap, DollarSign, Filter, MapPin, Star, Info, Navigation, RefreshCw, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import OverpassMap from '@/components/OverpassMap';
import { overpassService, ChargingStationDetails } from '@/services/overpassService';
import { ChargingStation } from '@/lib/supabase';
import { chargingStationService } from '@/services/chargingStations';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState(5); // in km
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [overpassStations, setOverpassStations] = useState<ChargingStationDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [selectedChargingSpeeds, setSelectedChargingSpeeds] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(100);
  const [userLocation, setUserLocation] = useState({ lat: 20.5937, lng: 78.9629 }); // Default to center of India
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [showStationDetails, setShowStationDetails] = useState(false);
  const [selectedOverpassStation, setSelectedOverpassStation] = useState<ChargingStationDetails | null>(null);
  const [showOverpassDetails, setShowOverpassDetails] = useState(false);
  const [shouldApplyFilters, setShouldApplyFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [manualLocation, setManualLocation] = useState({ lat: '', lng: '' });
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [isLocationSearching, setIsLocationSearching] = useState(false);
  
  const navigate = useNavigate();

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your location. Using default location instead.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  }, []);

  // Fetch stations from the app's database
  useEffect(() => {
    const fetchStations = async () => {
      setIsLoading(true);
      try {
        const result = await chargingStationService.getStations();
        setStations(result.stations || []);
      } catch (error) {
        console.error('Error fetching stations:', error);
        toast.error('Failed to fetch stations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Fetch stations from Overpass API when user location changes
  useEffect(() => {
    const fetchOverpassStations = async () => {
      setIsLoading(true);
      try {
        const result = await overpassService.findChargingStations(
          userLocation.lat,
          userLocation.lng,
          searchRadius
        );
        setOverpassStations(result);
      } catch (error) {
        console.error('Error fetching from Overpass:', error);
        toast.error('Failed to fetch OpenStreetMap stations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverpassStations();
  }, [userLocation, searchRadius]);

  // Handle filter changes
  const handleFilterChange = () => {
    // Set the flag to apply filters
    setShouldApplyFilters(true);
    toast.success(`Filters applied: Radius ${searchRadius}km, Max price: ₹${maxPrice}/kWh`);
  };

  // Calculate distance between user and station
  const calculateDistance = (stationLat: number, stationLng: number): number => {
    if (!userLocation) return 0;
    
    const R = 6371; // Radius of the earth in km
    const dLat = (stationLat - userLocation.lat) * (Math.PI/180);
    const dLon = (stationLng - userLocation.lng) * (Math.PI/180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * (Math.PI/180)) * Math.cos(stationLat * (Math.PI/180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return parseFloat(distance.toFixed(1));
  };

  // Convert an Overpass station to a format compatible with our app
  const convertOverpassToStation = (overpassStation: any): ChargingStation => {
    return {
      id: `overpass-${overpassStation.uniqueId || overpassStation.id}`,
      name: overpassStation.name || `EV Charging Station`,
      operator: overpassStation.operator || overpassStation.network || 'Unknown',
      address: overpassStation.access === 'private' ? 'Private Location' : 
              `${overpassStation.socket || 'Standard'} Charging Point`,
      city: '',
      state: '',
      country: '',
      available: overpassStation.status === 'out_of_order' ? false : true,
      price_per_kwh: overpassStation.fee ? 15 : 0, // Assume a standard price for fee-based stations
      vehicle_types: ['EV'],
      charging_speeds: [overpassStation.speed || 'Standard'],
      amenities: overpassStation.network ? [`${overpassStation.network} Network`] : [],
      location: {
        type: 'Point',
        coordinates: [parseFloat(overpassStation.lon), parseFloat(overpassStation.lat)]
      },
      created_at: new Date().toISOString() // Add required created_at property
    };
  };

  // Modify the filteredStations and sortedStations to include overpass stations
  const allStations = [...stations, ...overpassStations.map(convertOverpassToStation)];

  // Filter stations
  const filteredStations = allStations.filter(station => {
    if (!shouldApplyFilters) return true;
    
    // Filter by availability
    if (onlyAvailable && !station.available) return false;
    
    // Filter by vehicle type
    if (selectedVehicleTypes.length > 0 && 
        (!station.vehicle_types || station.vehicle_types.length === 0 ||
         !selectedVehicleTypes.some(type => station.vehicle_types?.includes(type)))) {
      return false;
    }
    
    // Filter by charging speed
    if (selectedChargingSpeeds.length > 0 && 
        (!station.charging_speeds || station.charging_speeds.length === 0 ||
         !selectedChargingSpeeds.some(speed => station.charging_speeds?.includes(speed)))) {
      return false;
    }
    
    // Filter by price
    if (station.price_per_kwh > maxPrice) return false;
    
    // Filter by search query (name, city, address)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        station.name.toLowerCase().includes(query) ||
        (station.city && station.city.toLowerCase().includes(query)) ||
        (station.address && station.address.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Sort stations by distance
  const sortedStations = [...filteredStations].sort((a, b) => {
    if (!a.location?.coordinates || !b.location?.coordinates) return 0;
    const distanceA = calculateDistance(a.location.coordinates[1], a.location.coordinates[0]);
    const distanceB = calculateDistance(b.location.coordinates[1], b.location.coordinates[0]);
    return distanceA - distanceB;
  });

  // Handle station selection on the map
  const handleStationSelect = (station: ChargingStation) => {
    setSelectedStation(station);
    setShowStationDetails(true);
  };

  // Handle view station details
  const handleViewStationDetails = (station: ChargingStation) => {
    navigate(`/stations/${station.id}`);
  };

  // Handle navigate to station
  const handleNavigateToStation = (station: ChargingStation) => {
    if (!station.location || !station.location.coordinates) return;
    
    const url = `https://www.openstreetmap.org/directions?from=${userLocation.lat},${userLocation.lng}&to=${station.location.coordinates[1]},${station.location.coordinates[0]}`;
    window.open(url, '_blank');
  };

  // Function to handle selecting an Overpass station
  const handleOverpassStationSelect = async (station: ChargingStationDetails) => {
    setSelectedOverpassStation(station);
    setShowOverpassDetails(true);
  };

  // Function to refresh station data
  const refreshStationData = async () => {
    setIsRefreshing(true);
    
    try {
      await fetchStationsForLocation(userLocation.lat, userLocation.lng);
      toast.success('Station data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing station data:', error);
      toast.error('Failed to refresh station data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualLocation.lat);
    const lng = parseFloat(manualLocation.lng);
    
    // Validate input
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Please enter valid coordinates');
      return;
    }
    
    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Coordinates out of valid range. Latitude: -90 to 90, Longitude: -180 to 180');
      return;
    }
    
    // Reset existing stations
    setOverpassStations([]);
    setStations([]);
    
    // Show loading state
    setIsLoading(true);
    
    // Update user location
    setUserLocation({ lat, lng });
    
    // Close the location input form
    setShowLocationInput(false);
    
    // Fetch stations with new coordinates
    fetchStationsForLocation(lat, lng);
    
    toast.success('Location updated successfully');
  };

  // Add a utility function to fetch stations for a specific location
  const fetchStationsForLocation = async (lat: number, lng: number) => {
    setIsLoading(true);
    
    try {
      console.log(`Fetching stations for location: [${lat}, ${lng}], radius: ${searchRadius}km`);
      
      // Fetch from Overpass API with proper error handling
      const overpassResult = await overpassService.findChargingStations(
        lat,
        lng,
        searchRadius
      );
      
      if (overpassResult && overpassResult.length > 0) {
        console.log(`Found ${overpassResult.length} stations from Overpass API`);
        
        // Create unique stations
        const uniqueStations = overpassResult.filter((station, index, self) => 
          index === self.findIndex(s => s.uniqueId === station.uniqueId)
        );
        
        console.log(`After deduplication: ${uniqueStations.length} unique stations`);
        setOverpassStations(uniqueStations);
      } else {
        console.log('No stations found from Overpass API');
        setOverpassStations([]);
      }
      
      // Fetch from database (normal stations)
      const result = await chargingStationService.getStations();
      setStations(result.stations || []);
      
      // Update last refreshed timestamp
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast.error('Failed to fetch stations for the new location');
      setOverpassStations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the searchLocation function to reset stations and handle errors better
  const searchLocation = async () => {
    if (!locationSearchQuery.trim()) {
      toast.error('Please enter a location name to search');
      return;
    }
    
    setIsLocationSearching(true);
    
    try {
      // Using Nominatim API to search for locations by name
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: locationSearchQuery,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'EV-Spark-Hub/1.0'
        }
      });
      
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const newLat = parseFloat(result.lat);
        const newLng = parseFloat(result.lon);
        
        console.log(`Location found: ${result.display_name} at [${newLat}, ${newLng}]`);
        
        // Reset existing stations
        setOverpassStations([]);
        setStations([]);
        
        // Update location
        setUserLocation({ lat: newLat, lng: newLng });
        
        // Update manual location fields for display
        setManualLocation({
          lat: newLat.toString(),
          lng: newLng.toString()
        });
        
        // Fetch stations with new location
        await fetchStationsForLocation(newLat, newLng);
        
        toast.success(`Location updated to ${result.display_name}`);
      } else {
        toast.error('No locations found with that name');
      }
    } catch (error) {
      console.error('Error searching for location:', error);
      toast.error('Failed to search for location');
    } finally {
      setIsLocationSearching(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-ev-dark-200">
      <Navbar />
      
      <main className="flex-grow pt-24 px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Find Charging Stations</h1>
            <p className="text-white/70 max-w-2xl">Locate the nearest EV charging stations with real-time availability, pricing, and amenities.</p>
            
            {/* Search and Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
              {/* Left sidebar - Filters */}
              <div className="neo-card rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
                
                <div className="space-y-5">
                  <div>
                    <h4 className="text-white mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-ev-green-400" />
                      Search Radius
                    </h4>
                    <Slider 
                      defaultValue={[searchRadius]} 
                      max={25} 
                      step={1} 
                      className="my-4" 
                      onValueChange={(value) => setSearchRadius(value[0])}
                    />
                    <div className="flex justify-between text-white/60 text-xs">
                      <span>1km</span>
                      <span>{searchRadius}km</span>
                      <span>25km</span>
                    </div>
                  </div>
                
                  <div>
                    <h4 className="text-white mb-2 flex items-center gap-2">
                      <Battery className="h-4 w-4 text-ev-green-400" />
                      Vehicle Type
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['2W', '3W', '4W', 'Heavy'].map((type) => (
                        <Button 
                          key={type} 
                          variant={selectedVehicleTypes.includes(type) ? "default" : "outline"}
                          className={selectedVehicleTypes.includes(type) 
                            ? "bg-ev-green-500 hover:bg-ev-green-600 text-white" 
                            : "border-white/10 text-white hover:bg-white/5 hover:text-ev-green-400"}
                          onClick={() => {
                            if (selectedVehicleTypes.includes(type)) {
                              setSelectedVehicleTypes(prev => prev.filter(t => t !== type));
                            } else {
                              setSelectedVehicleTypes(prev => [...prev, type]);
                            }
                          }}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-ev-green-400" />
                      Charging Speed
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['Fast', 'Normal', 'Slow'].map((speed) => (
                        <Button 
                          key={speed} 
                          variant={selectedChargingSpeeds.includes(speed) ? "default" : "outline"}
                          className={selectedChargingSpeeds.includes(speed) 
                            ? "bg-ev-green-500 hover:bg-ev-green-600 text-white" 
                            : "border-white/10 text-white hover:bg-white/5 hover:text-ev-green-400"}
                          onClick={() => {
                            if (selectedChargingSpeeds.includes(speed)) {
                              setSelectedChargingSpeeds(prev => prev.filter(s => s !== speed));
                            } else {
                              setSelectedChargingSpeeds(prev => [...prev, speed]);
                            }
                          }}
                        >
                          {speed}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-ev-green-400" />
                      Price Range
                    </h4>
                    <Slider 
                      defaultValue={[maxPrice]} 
                      max={100} 
                      step={1} 
                      className="my-4" 
                      onValueChange={(value) => setMaxPrice(value[0])}
                    />
                    <div className="flex justify-between text-white/60 text-xs">
                      <span>₹0</span>
                      <span>₹{maxPrice} per kWh</span>
                      <span>₹100</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="available" 
                        checked={onlyAvailable}
                        onCheckedChange={setOnlyAvailable}
                      />
                      <label htmlFor="available" className="text-white cursor-pointer">Available Now</label>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-ev-green-500 hover:bg-ev-green-600 text-white"
                    onClick={handleFilterChange}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
              
              {/* Right content - Map and Stations */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex w-full items-center space-x-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input 
                      placeholder="Search by location, station name, or address" 
                      className="pl-10 bg-ev-dark-100 border-white/10 text-white placeholder:text-white/40"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button className="bg-ev-green-500 hover:bg-ev-green-600 text-white">Search</Button>
                  <Button 
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5"
                    onClick={refreshStationData}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">
                    {overpassStations.length} stations found in your area
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-white/10 text-white hover:bg-white/5"
                      onClick={() => setShowLocationInput(!showLocationInput)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {showLocationInput ? 'Hide Location Input' : 'Set Location Manually'}
                    </Button>
                    <p className="text-sm text-white/60">
                      Last updated: {lastRefreshed.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                {showLocationInput && (
                  <div className="neo-card p-4 flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <label htmlFor="latitude" className="text-white text-sm">Latitude</label>
                      <Input
                        id="latitude"
                        type="text"
                        placeholder="e.g., 28.6139"
                        className="bg-ev-dark-100 border-white/10 text-white"
                        value={manualLocation.lat}
                        onChange={(e) => setManualLocation(prev => ({ ...prev, lat: e.target.value }))}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label htmlFor="longitude" className="text-white text-sm">Longitude</label>
                      <Input
                        id="longitude"
                        type="text"
                        placeholder="e.g., 77.2090"
                        className="bg-ev-dark-100 border-white/10 text-white"
                        value={manualLocation.lng}
                        onChange={(e) => setManualLocation(prev => ({ ...prev, lng: e.target.value }))}
                      />
                    </div>
                    <Button 
                      className="bg-ev-green-500 hover:bg-ev-green-600 text-white self-end"
                      onClick={handleManualLocationSubmit}
                    >
                      Set Location
                    </Button>
                  </div>
                )}
                
                {showLocationInput && (
                  <div className="neo-card p-4 mt-4">
                    <h4 className="text-white mb-3">Search by Place Name</h4>
                    <div className="flex gap-3">
                      <div className="flex-grow">
                        <Input
                          type="text"
                          placeholder="e.g., Delhi, India"
                          className="bg-ev-dark-100 border-white/10 text-white"
                          value={locationSearchQuery}
                          onChange={(e) => setLocationSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
                        />
                      </div>
                      <Button
                        className="bg-ev-green-500 hover:bg-ev-green-600 text-white"
                        onClick={searchLocation}
                        disabled={isLocationSearching}
                      >
                        {isLocationSearching ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          "Search Location"
                        )}
                      </Button>
                    </div>
                    <p className="text-white/40 text-xs mt-2">
                      Search for a city, address, or landmark to update the map location
                    </p>
                  </div>
                )}
                
                <div className="neo-card rounded-xl overflow-hidden relative">
                  {/* OpenStreetMap with Overpass API */}
                  <OverpassMap
                    containerId="stations-map"
                    stations={filteredStations}
                    userLocation={userLocation}
                    onStationSelect={handleStationSelect}
                    selectedStation={selectedStation}
                    radius={searchRadius}
                    overpassStations={overpassStations}
                    onOverpassStationsUpdate={setOverpassStations}
                  />
                  
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                      <div className="text-center bg-ev-dark-200 px-4 py-3 rounded-lg">
                        <p className="text-white">Loading stations...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <Tabs defaultValue="list" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-ev-dark-100 border border-white/10">
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="grid">Grid View</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="list" className="mt-4 space-y-4">
                    {sortedStations.length > 0 ? (
                      sortedStations.map((station) => {
                        // Check if this is an OpenStreetMap station (converted from overpass)
                        const isOverpassStation = station.id.toString().startsWith('overpass-');
                        
                        return (
                          <Card 
                            key={station.id} 
                            className={`neo-card p-4 hover:border-ev-green-500/30 transition-all ${isOverpassStation ? 'border-yellow-500/20' : ''}`}
                          >
                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                              <div className="flex-grow">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-white font-medium">{station.name}</h4>
                                  {isOverpassStation ? (
                                    <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">
                                      OpenStreetMap
                                    </Badge>
                                  ) : (
                                    <Badge className={station.available ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"}>
                                      {station.available ? 'Available' : 'Unavailable'}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-white/60 text-sm">
                                  {isOverpassStation ? `Operator: ${station.operator || 'Unknown'}` : `${station.address || ''}, ${station.city || ''}`}
                                </p>
                                <div className="flex gap-3 mt-2 text-xs text-white/50">
                                  {station.charging_speeds && station.charging_speeds[0] && (
                                    <span className="flex items-center gap-1">
                                      <Zap className="h-3 w-3 text-ev-green-400" />
                                      {station.charging_speeds[0]} Charging
                                    </span>
                                  )}
                                  <span>{isOverpassStation ? (station.price_per_kwh ? `₹${station.price_per_kwh}/kWh` : 'Free') : `₹${station.price_per_kwh}/kWh`}</span>
                                  {station.location && station.location.coordinates && (
                                    <span>{calculateDistance(station.location.coordinates[1], station.location.coordinates[0])} km away</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-white/10 text-white hover:bg-white/5"
                                  onClick={() => {
                                    if (isOverpassStation) {
                                      const id = parseInt(station.id.replace('overpass-', ''));
                                      window.open(`https://www.openstreetmap.org/node/${id}`, '_blank');
                                    } else {
                                      handleViewStationDetails(station);
                                    }
                                  }}
                                >
                                  <Info className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-ev-green-500 hover:bg-ev-green-600 text-white whitespace-nowrap"
                                  onClick={() => handleNavigateToStation(station)}
                                >
                                  <Navigation className="h-4 w-4 mr-1" />
                                  Navigate
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-white/60">No stations found with the current filters</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="grid" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sortedStations.length > 0 ? (
                        sortedStations.map((station) => {
                          // Check if this is an OpenStreetMap station (converted from overpass)
                          const isOverpassStation = station.id.toString().startsWith('overpass-');
                          
                          return (
                            <Card 
                              key={station.id} 
                              className={`neo-card p-4 hover:border-ev-green-500/30 transition-all ${isOverpassStation ? 'border-yellow-500/20' : ''}`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-white font-medium">{station.name}</h4>
                                  {isOverpassStation ? (
                                    <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">
                                      OpenStreetMap
                                    </Badge>
                                  ) : (
                                    <Badge className={station.available ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"}>
                                      {station.available ? 'Available' : 'Unavailable'}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-white/60 text-sm">
                                  {isOverpassStation ? `Operator: ${station.operator || 'Unknown'}` : `${station.address || ''}, ${station.city || ''}`}
                                </p>
                                <div className="flex gap-3 mt-2 text-xs text-white/50">
                                  {station.charging_speeds && station.charging_speeds[0] && (
                                    <span className="flex items-center gap-1">
                                      <Zap className="h-3 w-3 text-ev-green-400" />
                                      {station.charging_speeds[0]} Charging
                                    </span>
                                  )}
                                  <span>{isOverpassStation ? (station.price_per_kwh ? `₹${station.price_per_kwh}/kWh` : 'Free') : `₹${station.price_per_kwh}/kWh`}</span>
                                  {station.location && station.location.coordinates && (
                                    <span>{calculateDistance(station.location.coordinates[1], station.location.coordinates[0])} km away</span>
                                  )}
                                </div>
                                <div className="flex gap-2 mt-4">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="flex-1 border-white/10 text-white hover:bg-white/5"
                                    onClick={() => {
                                      if (isOverpassStation) {
                                        const id = parseInt(station.id.replace('overpass-', ''));
                                        window.open(`https://www.openstreetmap.org/node/${id}`, '_blank');
                                      } else {
                                        handleViewStationDetails(station);
                                      }
                                    }}
                                  >
                                    <Info className="h-4 w-4 mr-1" />
                                    Details
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="flex-1 bg-ev-green-500 hover:bg-ev-green-600 text-white"
                                    onClick={() => handleNavigateToStation(station)}
                                  >
                                    <Navigation className="h-4 w-4 mr-1" />
                                    Navigate
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })
                      ) : (
                        <div className="col-span-2 text-center py-8">
                          <p className="text-white/60">No stations found with the current filters</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Station Details Dialog */}
      <Dialog open={showStationDetails} onOpenChange={setShowStationDetails}>
        <DialogContent className="bg-ev-dark-100 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedStation?.name}
              <Badge className={selectedStation?.available ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                {selectedStation?.available ? 'Available' : 'Unavailable'}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {selectedStation?.address}, {selectedStation?.city}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-ev-dark-200/50 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2">Station Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-white/60">Price:</div>
                <div className="text-white">₹{selectedStation?.price_per_kwh}/kWh</div>
                
                <div className="text-white/60">Operator:</div>
                <div className="text-white">{selectedStation?.operator || 'N/A'}</div>
                
                <div className="text-white/60">Charging Speed:</div>
                <div className="text-white">{selectedStation?.charging_speeds?.join(', ') || 'N/A'}</div>
                
                <div className="text-white/60">Vehicle Types:</div>
                <div className="text-white">{selectedStation?.vehicle_types?.join(', ') || 'N/A'}</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-ev-green-500 hover:bg-ev-green-600 text-white"
                onClick={() => handleNavigateToStation(selectedStation!)}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Navigate
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-white/10 text-white hover:bg-white/5"
                onClick={() => {
                  setShowStationDetails(false);
                  if (selectedStation) {
                    handleViewStationDetails(selectedStation);
                  }
                }}
              >
                <Info className="h-4 w-4 mr-2" />
                Full Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StationsPage;
