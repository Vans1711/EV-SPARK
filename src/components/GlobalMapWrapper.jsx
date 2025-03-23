import { useEffect } from 'react';

export default function GlobalMapWrapper({ 
  containerId, 
  stations = [], 
  userLocation = { lat: 20.5937, lng: 78.9629 } 
}) {
  // Use the global function to initialize the map
  useEffect(() => {
    // Make sure our map script is loaded
    if (typeof window.initializeEvMap !== 'function') {
      console.error('Map initialization function not found on window object');
      return;
    }
    
    // Initialize the map
    window.initializeEvMap(containerId, {
      stations,
      userLocation
    });
    
    // Cleanup
    return () => {
      // If we have a map instance stored on window, remove it
      if (window.evMap) {
        window.evMap.remove();
        window.evMap = null;
      }
      // Also clear the container
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
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
        position: 'relative'
      }} 
    ></div>
  );
} 