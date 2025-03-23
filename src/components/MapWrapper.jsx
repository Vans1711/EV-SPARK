import { useEffect, useRef } from 'react';
import initializeMap from './VanillaMap';

export default function MapWrapper({ 
  containerId, 
  stations = [], 
  userLocation = { lat: 20.5937, lng: 78.9629 } 
}) {
  const mapInstance = useRef(null);
  
  // Initialize map when component mounts
  useEffect(() => {
    if (mapInstance.current) {
      // Clean up previous map
      mapInstance.current.remove();
      mapInstance.current = null;
    }
    
    // Initialize new map
    const map = initializeMap(containerId, {
      stations,
      userLocation,
      zoom: 10
    });
    
    // Store reference to map
    mapInstance.current = map;
    
    // Clean up on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [containerId, stations, userLocation]);
  
  return (
    <div 
      id={containerId}
      style={{ 
        width: '100%', 
        height: '400px', 
        backgroundColor: '#f0f0f0',
        position: 'relative',
        zIndex: 1
      }} 
    ></div>
  );
} 