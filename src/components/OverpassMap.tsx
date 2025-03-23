import { useEffect, useState, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { ChargingStation } from '@/lib/supabase';
import { Loader2, RefreshCw } from 'lucide-react';
import { ChargingStationDetails, overpassService } from '@/services/overpassService';
import { Button } from '@/components/ui/button';

interface OverpassMapProps {
  containerId: string;
  stations?: ChargingStation[];
  userLocation?: { lat: number, lng: number };
  onStationSelect?: (station: ChargingStation) => void;
  selectedStation?: ChargingStation | null;
  radius?: number; // Search radius in kilometers
  overpassStations?: ChargingStationDetails[];
  onOverpassStationsUpdate?: (stations: ChargingStationDetails[]) => void;
}

const OverpassMap: React.FC<OverpassMapProps> = ({
  containerId,
  stations = [],
  userLocation = { lat: 20.5937, lng: 78.9629 }, // Default to center of India
  onStationSelect,
  selectedStation,
  radius = 5, // Default search radius (km)
  overpassStations = [],
  onOverpassStationsUpdate
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [markersRef, setMarkersRef] = useState<L.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const autoRefreshIntervalRef = useRef<number | null>(null);
  
  // Clean up function
  const cleanupMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  };

  // Fetch stations from Overpass API
  const fetchStations = useCallback(async () => {
    if (!userLocation || isNaN(userLocation.lat) || isNaN(userLocation.lng)) {
      console.error("Invalid location coordinates:", userLocation);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log(`Fetching stations at lat: ${userLocation.lat}, lng: ${userLocation.lng}, radius: ${radius}km`);
      
      // Clear existing data first to prevent duplicates
      if (onOverpassStationsUpdate) {
        onOverpassStationsUpdate([]);
      }
      
      const result = await overpassService.findChargingStations(
        userLocation.lat,
        userLocation.lng,
        radius
      );
      
      // Ensure each station has a unique identifier to prevent duplicates
      const uniqueResults = result.filter((station, index, self) => 
        index === self.findIndex(s => s.uniqueId === station.uniqueId)
      );
      
      console.log(`Found ${uniqueResults.length} unique stations near [${userLocation.lat}, ${userLocation.lng}]`);
      setLastUpdated(new Date());
      
      if (onOverpassStationsUpdate) {
        onOverpassStationsUpdate(uniqueResults);
      }
    } catch (error) {
      console.error('Error fetching from Overpass:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation.lat, userLocation.lng, radius, onOverpassStationsUpdate]);
  
  // Initialize map on component mount
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clean up previous map
    cleanupMap();
    
    // Ensure the map container has proper dimensions
    mapRef.current.style.width = '100%';
    mapRef.current.style.height = '400px';
    
    // Create map instance
    const mapInstance = L.map(mapRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: true
    });
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);
    
    // Store map instance in ref
    mapInstanceRef.current = mapInstance;
    
    // Force recalculation of map dimensions after rendering
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);
    
    // Clean up on unmount
    return cleanupMap;
  }, [userLocation.lat, userLocation.lng]);

  // Set up auto-refresh
  useEffect(() => {
    // Clear any existing interval
    if (autoRefreshIntervalRef.current) {
      window.clearInterval(autoRefreshIntervalRef.current);
      autoRefreshIntervalRef.current = null;
    }
    
    // Set up new interval if auto-refresh is enabled
    if (isAutoRefreshEnabled) {
      // Refresh every 30 seconds
      autoRefreshIntervalRef.current = window.setInterval(() => {
        fetchStations();
      }, 30000);
    }
    
    // Clean up on unmount
    return () => {
      if (autoRefreshIntervalRef.current) {
        window.clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [isAutoRefreshEnabled, fetchStations]);
  
  // Update user location marker and search radius circle separately
  useEffect(() => {
    const mapInstance = mapInstanceRef.current;
    if (!mapInstance) return;
    
    // Clear previous user marker and radius circle
    const markerLayerGroup = L.layerGroup().addTo(mapInstance);
    
    // Create user location marker
    const userIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    // Add user location marker
    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .bindPopup('<div style="text-align: center;"><strong>Your Location</strong></div>')
      .addTo(markerLayerGroup);
    
    // Add search radius circle
    const radiusCircle = L.circle([userLocation.lat, userLocation.lng], {
      radius: radius * 1000, // Convert km to meters
      color: '#10b981',
      fillColor: '#10b98133',
      fillOpacity: 0.15
    }).addTo(markerLayerGroup);
    
    // Pan the map to the new location
    mapInstance.panTo([userLocation.lat, userLocation.lng]);
    
    // Open the popup immediately
    userMarker.openPopup();
    
    // Clean up on effect cleanup
    return () => {
      mapInstance.removeLayer(markerLayerGroup);
    };
  }, [userLocation.lat, userLocation.lng, radius]);
  
  // Fetch stations when location or radius changes
  useEffect(() => {
    // Don't fetch if coordinates are invalid
    if (!userLocation || isNaN(userLocation.lat) || isNaN(userLocation.lng)) {
      console.error("Invalid location coordinates:", userLocation);
      return;
    }
    
    console.log("OverpassMap: Location changed, fetching stations for:", userLocation);
    
    // Clear existing stations before fetching new ones
    if (onOverpassStationsUpdate) {
      onOverpassStationsUpdate([]);
    }
    
    // Fetch immediately when coordinates change
    fetchStations();
    
  }, [userLocation.lat, userLocation.lng, radius, fetchStations]);
  
  // Add markers for EV charging stations
  useEffect(() => {
    const mapInstance = mapInstanceRef.current;
    if (!mapInstance) return;
    
    // Remove previous markers
    markersRef.forEach(marker => marker.remove());
    
    // Create combined markers array for both application stations and Overpass stations
    const newMarkers: L.Marker[] = [];
    
    // Add application stations
    stations.forEach(station => {
      if (!station.location || !station.location.coordinates) return;
      
      // Calculate distance from user location
      const stationLat = station.location.coordinates[1];
      const stationLng = station.location.coordinates[0];
      
      // Create icon based on availability
      const icon = L.icon({
        iconUrl: station.available 
          ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
          : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      
      // Create marker
      const marker = L.marker(
        [stationLat, stationLng],
        { icon }
      );
      
      // Create popup content
      const popupHTML = `
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="font-weight: 600; color: #333; margin-bottom: 8px;">${station.name}</h3>
          <div style="font-size: 14px; color: #666;">
            <p style="margin: 4px 0;">Price: ₹${station.price_per_kwh}/kWh</p>
            <p style="margin: 4px 0; display: flex; align-items: center;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; background-color: ${station.available ? '#10b981' : '#ef4444'};"></span>
              ${station.available ? 'Available' : 'Unavailable'}
            </p>
          </div>
          <button 
            onclick="window.open('https://www.openstreetmap.org/directions?from=${userLocation.lat},${userLocation.lng}&to=${stationLat},${stationLng}', '_blank')"
            style="width: 100%; margin-top: 8px; padding: 4px 8px; background-color: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;"
          >
            <svg style="width: 12px; height: 12px; margin-right: 4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
            Navigate
          </button>
        </div>
      `;
      
      // Add popup
      marker.bindPopup(popupHTML);
      
      // Add click handler
      marker.on('click', () => {
        if (onStationSelect) {
          onStationSelect(station);
        }
      });
      
      // Add marker to map
      marker.addTo(mapInstance);
      newMarkers.push(marker);
    });
    
    // Add Overpass stations
    overpassStations.forEach(station => {
      if (!station.lat || !station.lon) return;
      
      // Determine marker color based on status
      let markerColor = 'gold'; // Default color for overpass stations
      
      // If status information is available, use appropriate color
      if (station.status) {
        if (station.status === 'operational' || station.status === 'working') {
          markerColor = 'green';
        } else if (station.status === 'out_of_order' || station.status === 'closed' || station.status === 'non_operational') {
          markerColor = 'red';
        } else if (station.status === 'under_construction' || station.status === 'planned') {
          markerColor = 'orange';
        }
      }
      
      // Create icon for Overpass stations
      const icon = L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      
      // Create marker
      const marker = L.marker([station.lat, station.lon], { icon });
      
      // Create popup content with distance information
      const distanceText = station.distance ? `${station.distance} km away` : '';
      
      // Determine status display
      let statusDisplay = 'Unknown';
      let statusColor = '#888';
      
      if (station.status) {
        if (station.status === 'operational' || station.status === 'working') {
          statusDisplay = 'Operational';
          statusColor = '#10b981'; // Green
        } else if (station.status === 'out_of_order' || station.status === 'closed' || station.status === 'non_operational') {
          statusDisplay = 'Out of Order';
          statusColor = '#ef4444'; // Red
        } else if (station.status === 'under_construction' || station.status === 'planned') {
          statusDisplay = 'Under Construction';
          statusColor = '#f59e0b'; // Amber
        } else {
          statusDisplay = station.status.replace('_', ' ');
        }
      }
      
      // Format last status update date if available
      let lastUpdateDisplay = '';
      if (station.lastStatusUpdate) {
        try {
          const updateDate = new Date(station.lastStatusUpdate);
          lastUpdateDisplay = updateDate.toLocaleDateString();
        } catch (e) {
          lastUpdateDisplay = station.lastStatusUpdate;
        }
      }
      
      const popupHTML = `
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="font-weight: 600; color: #333; margin-bottom: 8px;">${station.name}</h3>
          <div style="font-size: 14px; color: #666;">
            ${distanceText ? `<p style="margin: 4px 0; font-weight: 500; color: #444;">${distanceText}</p>` : ''}
            <p style="margin: 4px 0; display: flex; align-items: center;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; background-color: ${statusColor};"></span>
              Status: ${statusDisplay}
            </p>
            ${lastUpdateDisplay ? `<p style="margin: 4px 0; font-size: 12px; color: #888;">Last updated: ${lastUpdateDisplay}</p>` : ''}
            <p style="margin: 4px 0;">Operator: ${station.operator}</p>
            <p style="margin: 4px 0;">Socket: ${station.socket}</p>
            <p style="margin: 4px 0;">Speed: ${station.speed}</p>
            <p style="margin: 4px 0;">Fee: ${station.fee ? 'Paid' : 'Free'}</p>
            ${station.capacity ? `<p style="margin: 4px 0;">Capacity: ${station.capacity} vehicles</p>` : ''}
          </div>
          <button 
            onclick="window.open('https://www.openstreetmap.org/directions?from=${userLocation.lat},${userLocation.lng}&to=${station.lat},${station.lon}', '_blank')"
            style="width: 100%; margin-top: 8px; padding: 4px 8px; background-color: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;"
          >
            <svg style="width: 12px; height: 12px; margin-right: 4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
            Navigate
          </button>
        </div>
      `;
      
      // Add popup
      marker.bindPopup(popupHTML);
      
      // Add to map
      marker.addTo(mapInstance);
      newMarkers.push(marker);
    });
    
    // Update markers ref
    setMarkersRef(newMarkers);
  }, [stations, overpassStations, userLocation]);
  
  // Handle selected station changes
  useEffect(() => {
    const mapInstance = mapInstanceRef.current;
    if (!mapInstance || !selectedStation || !selectedStation.location || !selectedStation.location.coordinates) return;
    
    // Fly to selected station
    mapInstance.flyTo(
      [selectedStation.location.coordinates[1], selectedStation.location.coordinates[0]],
      16
    );
    
    // Find and open the popup for selected station
    const selectedMarker = markersRef.find(marker => {
      const pos = marker.getLatLng();
      return pos.lat === selectedStation.location!.coordinates[1] && 
             pos.lng === selectedStation.location!.coordinates[0];
    });
    
    if (selectedMarker) {
      selectedMarker.openPopup();
    }
  }, [selectedStation]);
  
  return (
    <div className="relative">
      <div id={containerId} ref={mapRef} className="map-container" />
      
      {/* Real-time update controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-ev-dark-200/90 border-white/10 text-white hover:bg-white/10"
          onClick={() => fetchStations()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <div className="bg-ev-dark-200/90 text-white text-xs px-2 py-1 rounded text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>
      
      {isLoading && (
        <div className="absolute bottom-4 right-4 bg-ev-dark-200/90 px-3 py-1 rounded-lg z-10">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-ev-green-400" />
            <span className="text-white text-sm">Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverpassMap; 