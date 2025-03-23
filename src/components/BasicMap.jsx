import { useEffect } from 'react';

// This component uses a direct DOM approach to render the map
// which can help avoid React rendering issues with Leaflet
export default function BasicMap({ 
  containerId, 
  stations = [], 
  userLocation = { lat: 20.5937, lng: 78.9629 } 
}) {
  useEffect(() => {
    // Wait for the DOM to be fully ready
    setTimeout(() => {
      const initMap = () => {
        // Make sure Leaflet is available
        if (!window.L) {
          console.error('Leaflet is not loaded');
          return;
        }
        
        // Get the container
        const container = document.getElementById(containerId);
        if (!container) {
          console.error('Map container not found');
          return;
        }
        
        // Clear previous content
        container.innerHTML = '';
        
        // Set dimensions explicitly
        container.style.width = '100%';
        container.style.height = '400px';
        
        // Create map instance
        const map = window.L.map(container).setView([userLocation.lat, userLocation.lng], 10);
        
        // Add tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(map);
        
        // Add user location marker
        const blueIcon = window.L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        window.L.marker([userLocation.lat, userLocation.lng], { icon: blueIcon })
          .addTo(map)
          .bindPopup('<b>Your Location</b>')
          .openPopup();
          
        // Add station markers
        stations.forEach(station => {
          if (!station.location || !station.location.coordinates) return;
          
          const icon = window.L.icon({
            iconUrl: station.available 
              ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
              : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          
          window.L.marker(
            [station.location.coordinates[1], station.location.coordinates[0]], 
            { icon }
          )
            .addTo(map)
            .bindPopup(`
              <div>
                <h3>${station.name}</h3>
                <p>Price: ₹${station.price_per_kwh}/kWh</p>
                <p>${station.available ? 'Available' : 'Unavailable'}</p>
                <button onclick="window.open('https://www.openstreetmap.org/directions?from=${userLocation.lat},${userLocation.lng}&to=${station.location.coordinates[1]},${station.location.coordinates[0]}', '_blank')">
                  Navigate
                </button>
              </div>
            `);
        });
        
        // Force a rerender after map is initialized
        setTimeout(() => {
          map.invalidateSize();
        }, 300);
      };
      
      initMap();
    }, 100);
    
    // Cleanup function
    return () => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [containerId, stations, userLocation]);
  
  return (
    <div id={containerId} style={{ width: '100%', height: '400px', backgroundColor: '#f0f0f0' }}></div>
  );
} 