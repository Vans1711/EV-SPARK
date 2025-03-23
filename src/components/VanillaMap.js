// This module exports a function that initializes a Leaflet map
// It intentionally doesn't use React to avoid rendering issues

export default function initializeMap(elementId, options = {}) {
  const {
    center = [20.5937, 78.9629], // Default center of India
    zoom = 10,
    stations = [],
    userLocation = { lat: 20.5937, lng: 78.9629 }
  } = options;
  
  // Check if Leaflet is available
  if (!window.L) {
    console.error('Leaflet is not available on window object');
    return null;
  }
  
  // Check if element exists
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return null;
  }
  
  // Clear any existing content
  element.innerHTML = '';
  
  // Set size explicitly
  element.style.width = '100%';
  element.style.height = '400px';
  
  // Create map
  const map = window.L.map(element).setView([userLocation.lat, userLocation.lng], zoom);
  
  // Add tile layer
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Create markers
  
  // User location
  const userMarker = window.L.marker([userLocation.lat, userLocation.lng], {
    icon: window.L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  }).addTo(map);
  userMarker.bindPopup('<b>Your Location</b>').openPopup();
  
  // Station markers
  stations.forEach(station => {
    if (!station.location || !station.location.coordinates) return;
    
    const marker = window.L.marker(
      [station.location.coordinates[1], station.location.coordinates[0]],
      {
        icon: window.L.icon({
          iconUrl: station.available 
            ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
            : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }
    ).addTo(map);
    
    marker.bindPopup(`
      <div style="padding: 8px; min-width: 200px;">
        <h3 style="font-weight: 600; color: #333; margin-bottom: 8px;">${station.name}</h3>
        <div style="margin-bottom: 8px;">
          <p style="margin: 4px 0;">Price: ₹${station.price_per_kwh}/kWh</p>
          <p style="margin: 4px 0;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; background-color: ${station.available ? '#10b981' : '#ef4444'};"></span>
            ${station.available ? 'Available' : 'Unavailable'}
          </p>
        </div>
        <button 
          onclick="window.open('https://www.openstreetmap.org/directions?from=${userLocation.lat},${userLocation.lng}&to=${station.location.coordinates[1]},${station.location.coordinates[0]}', '_blank')"
          style="width: 100%; padding: 4px 8px; background-color: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          Navigate
        </button>
      </div>
    `);
  });
  
  // Force map to recalculate size
  setTimeout(() => {
    map.invalidateSize();
  }, 100);
  
  return map;
} 