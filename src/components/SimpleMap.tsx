import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChargingStation } from '@/lib/supabase';

interface SimpleMapProps {
  containerId: string;
  stations?: ChargingStation[];
  userLocation?: { lat: number, lng: number };
  onStationSelect?: (station: ChargingStation) => void;
  selectedStation?: ChargingStation | null;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ 
  containerId, 
  stations = [], 
  userLocation = { lat: 20.5937, lng: 78.9629 }, 
  onStationSelect,
  selectedStation
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [markersRef, setMarkersRef] = useState<L.Marker[]>([]);
  
  // Clean up function
  const cleanupMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  };
  
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
      zoom: 10,
      zoomControl: true,
      attributionControl: true
    });
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);
    
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
    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(mapInstance)
      .bindPopup('<div style="text-align: center;"><strong>Your Location</strong></div>')
      .openPopup();
    
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
  }, [userLocation]);
  
  // Add station markers whenever stations or map changes
  useEffect(() => {
    const mapInstance = mapInstanceRef.current;
    if (!mapInstance) return;
    
    // Remove previous markers
    markersRef.forEach(marker => marker.remove());
    
    // Create station markers
    const newMarkers: L.Marker[] = [];
    
    stations.forEach(station => {
      if (!station.location || !station.location.coordinates) return;
      
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
        [station.location.coordinates[1], station.location.coordinates[0]],
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
            onclick="window.open('https://www.openstreetmap.org/directions?from=${userLocation.lat},${userLocation.lng}&to=${station.location.coordinates[1]},${station.location.coordinates[0]}', '_blank')"
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
    
    // Update markers ref
    setMarkersRef(newMarkers);
  }, [stations, userLocation, mapInstanceRef.current]);
  
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
  
  return <div id={containerId} ref={mapRef} className="map-container" />;
};

export default SimpleMap; 