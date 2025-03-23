import axios from 'axios';

export interface OverpassNode {
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    amenity?: string;
    'charge:socket'?: string;
    'charge:speed'?: string;
    'charge:status'?: string;
    'check_date:charge'?: string;
    operator?: string;
    fee?: string;
    access?: string;
    capacity?: string;
    'socket:type2'?: string;
    'socket:type1'?: string;
    'socket:chademo'?: string;
    'socket:ccs'?: string;
    'charge:output'?: string;
    'charge:fee'?: string;
    'charge:access'?: string;
    payment?: string;
    operational?: string;
    'operational_status'?: string;
    network?: string;
    brand?: string;
    [key: string]: string | undefined;
  };
}

export interface ChargingStationDetails {
  id: number;
  lat: number;
  lon: number;
  name: string;
  operator: string;
  socket: string;
  speed: string;
  fee: boolean;
  access: string;
  status?: string;
  lastStatusUpdate?: string;
  capacity?: number;
  source: 'overpass';
  distance?: number; // Distance in kilometers
  network?: string;
  power?: string;
  uniqueId?: string;
}

class OverpassService {
  // Use multiple API endpoints to handle potential failures
  private baseUrls = [
    'https://overpass-api.de/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];
  private currentUrlIndex = 0;

  /**
   * Search for EV charging stations near a specific location
   * 
   * @param lat Latitude of the center point
   * @param lng Longitude of the center point
   * @param radius Search radius in kilometers
   * @returns Array of charging stations
   */
  async findChargingStations(lat: number, lng: number, radius: number = 5): Promise<ChargingStationDetails[]> {
    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.error('Invalid coordinates:', { lat, lng });
      return [];
    }

    // Validate radius
    if (isNaN(radius) || radius <= 0) {
      console.error('Invalid radius:', radius);
      radius = 5; // Use default radius
    }
    
    console.log(`OverpassService: Searching for stations at [${lat}, ${lng}] with radius ${radius}km`);
    
    // Generate a unique request ID for this specific search that includes location
    const requestId = `${lat.toFixed(6)}-${lng.toFixed(6)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Try each API endpoint until one works
    for (let attempt = 0; attempt < this.baseUrls.length; attempt++) {
      try {
        const currentUrl = this.baseUrls[this.currentUrlIndex];
        console.log(`Attempting to fetch from ${currentUrl} (attempt ${attempt + 1}/${this.baseUrls.length})`);
        
        // Prepare enhanced Overpass query with more details and use current timestamp to prevent caching
        const timestamp = Date.now();
        const overpassQuery = `
          [out:json][timeout:25][date:"${new Date().toISOString()}"];
          (
            node["amenity"="charging_station"](around:${radius * 1000},${lat},${lng});
          );
          out body;
          >;
          out skel qt;
        `;
        
        // Fetch data from Overpass API with timeout and cache prevention
        const response = await axios.post(currentUrl, overpassQuery, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Requested-With': `ev-spark-hub-${requestId}`
          },
          timeout: 20000, // 20 seconds timeout
          // Add timestamp to prevent caching
          params: {
            _noCache: timestamp
          }
        });
        
        // If successful, return the results
        if (response.data && response.data.elements && Array.isArray(response.data.elements)) {
          console.log(`Received ${response.data.elements.length} elements from Overpass API`);
          
          // Filter to only node elements
          const nodes = response.data.elements.filter((element: any) => element.type === 'node');
          console.log(`Found ${nodes.length} node elements`);
          
          // Process and map response data
          const stations = nodes.map((station: OverpassNode, index: number) => {
            // Add current timestamp and request ID to uniqueId to ensure uniqueness across calls
            const stationDetails = this.mapNodeToStation(station, index, requestId);
            // Calculate distance from the search point
            stationDetails.distance = this.calculateDistance(lat, lng, station.lat, station.lon);
            return stationDetails;
          });
          
          // Filter out duplicate stations by coordinates (keep the closest one to the search point)
          const uniqueStationMap = new Map<string, ChargingStationDetails>();
          
          stations.forEach(station => {
            // Create a coordinate key with precision of 6 decimal places (approx 10cm precision)
            const coordKey = `${station.lat.toFixed(6)},${station.lon.toFixed(6)}`;
            
            if (!uniqueStationMap.has(coordKey) || 
                (station.distance || Infinity) < (uniqueStationMap.get(coordKey)?.distance || Infinity)) {
              uniqueStationMap.set(coordKey, station);
            }
          });
          
          // Convert map to array and sort by distance
          const uniqueStations = Array.from(uniqueStationMap.values());
          const sortedStations = uniqueStations.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          
          console.log(`Returning ${sortedStations.length} unique stations sorted by distance`);
          return sortedStations;
        }
        
        // Rotate to next URL for next time
        this.currentUrlIndex = (this.currentUrlIndex + 1) % this.baseUrls.length;
        console.log('No stations found in the response');
        return [];
      } catch (error) {
        console.error(`Error fetching from endpoint ${this.baseUrls[this.currentUrlIndex]}:`, error);
        
        // Try the next URL
        this.currentUrlIndex = (this.currentUrlIndex + 1) % this.baseUrls.length;
        
        // If we've tried all URLs, return empty array
        if (attempt === this.baseUrls.length - 1) {
          console.error('All Overpass API endpoints failed');
          return [];
        }
      }
    }
    
    return []; // Fallback return in case all attempts fail
  }

  /**
   * Convert Overpass node to a ChargingStationDetails object
   */
  private mapNodeToStation(node: OverpassNode, index: number, requestId: string = ''): ChargingStationDetails {
    // Create a unique ID for this station based on node ID, request ID and index to ensure uniqueness
    const uniqueId = `${node.id}-${requestId}-${index}`;
    
    // Get name from tags, with specific handling for name tags
    let name = '';
    if (node.tags?.name) {
      name = node.tags.name;
    } else if (node.tags?.['name:en']) {
      name = node.tags['name:en'];
    } else if (node.tags?.operator) {
      name = `${node.tags.operator} Charging Station`;
    } else if (node.tags?.brand) {
      name = `${node.tags.brand} Charging Station`;
    } else if (node.tags?.network) {
      name = `${node.tags.network} Charging Point`;
    } else {
      name = `EV Charging Station ${uniqueId.substring(0, 5)}`;
    }
    
    // Extract capacity information if available
    let capacity: number | undefined = undefined;
    if (node.tags?.capacity) {
      const capacityValue = parseInt(node.tags.capacity);
      if (!isNaN(capacityValue)) {
        capacity = capacityValue;
      }
    }
    
    // Extract socket type information
    const socket = node.tags?.['socket'] || 
                  node.tags?.['charge:socket'] || 
                  (node.tags?.['socket:type2'] === 'yes' ? 'Type 2' :
                  node.tags?.['socket:type1'] === 'yes' ? 'Type 1' :
                  node.tags?.['socket:chademo'] === 'yes' ? 'CHAdeMO' :
                  node.tags?.['socket:ccs'] === 'yes' ? 'CCS' :
                  'Standard Socket');
    
    // Determine charging speed
    let speed = 'Standard';
    let power: string | undefined = undefined;
    
    if (node.tags?.['charge:speed']) {
      speed = node.tags['charge:speed'];
    } else if (node.tags?.['charge:output']) {
      const output = parseFloat(node.tags['charge:output']);
      power = `${output} kW`;
      if (!isNaN(output)) {
        if (output >= 150) speed = 'Ultra Fast';
        else if (output >= 50) speed = 'Fast';
        else if (output >= 22) speed = 'Rapid';
        else if (output >= 7) speed = 'Normal';
        else speed = 'Slow';
      }
    } else if (node.tags?.['socket:ccs'] === 'yes' || node.tags?.['socket:chademo'] === 'yes') {
      speed = 'Fast';
    }
    
    // Check if there's a fee
    const fee = node.tags?.fee === 'yes' || 
               node.tags?.['charge:fee'] === 'yes' || 
               node.tags?.payment === 'yes';
    
    // Check access type
    const access = node.tags?.access || 
                   node.tags?.['charge:access'] || 
                   'Public';
    
    // Check operational status
    const status = node.tags?.['charge:status'] || 
                   node.tags?.['operational_status'] || 
                   (node.tags?.operational === 'yes' ? 'operational' : undefined);
    
    // Get network or brand
    const network = node.tags?.network || 
                    node.tags?.brand || 
                    undefined;
    
    return {
      id: node.id,
      lat: node.lat,
      lon: node.lon,
      name: name,
      operator: node.tags?.operator || network || 'Unknown Operator',
      socket: socket,
      speed: speed,
      fee: fee,
      access: access,
      status: status,
      lastStatusUpdate: node.tags?.['check_date:charge'] || undefined,
      capacity: capacity,
      source: 'overpass',
      network: network,
      power: power,
      uniqueId: uniqueId
    };
  }

  /**
   * Calculate distance between two points using the Haversine formula
   * 
   * @param lat1 Latitude of first point
   * @param lon1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lon2 Longitude of second point
   * @returns Distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return parseFloat(distance.toFixed(1));
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Get detailed information about a specific charging station
   * 
   * @param nodeId The OpenStreetMap node ID
   * @returns Charging station details or null if not found
   */
  async getStationDetails(nodeId: number): Promise<ChargingStationDetails | null> {
    // Try each API endpoint until one works
    for (let attempt = 0; attempt < this.baseUrls.length; attempt++) {
      try {
        const currentUrl = this.baseUrls[this.currentUrlIndex];
        
        // Prepare Overpass query for a specific node
        const overpassQuery = `
          [out:json];
          node(${nodeId});
          out body;
          >;
          out skel qt;
        `;
        
        // Fetch data from Overpass API
        const response = await axios.post(currentUrl, overpassQuery, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000 // 10 seconds timeout
        });
        
        if (response.data && response.data.elements && response.data.elements[0]) {
          // Process and return the station details
          return this.mapNodeToStation(response.data.elements[0], 0);
        }
        
        // Rotate to next URL for next time
        this.currentUrlIndex = (this.currentUrlIndex + 1) % this.baseUrls.length;
      } catch (error) {
        console.error(`Error fetching from endpoint ${this.baseUrls[this.currentUrlIndex]}:`, error);
        
        // Try the next URL
        this.currentUrlIndex = (this.currentUrlIndex + 1) % this.baseUrls.length;
        
        // If we've tried all URLs, return null
        if (attempt === this.baseUrls.length - 1) {
          console.error('All Overpass API endpoints failed');
          return null;
        }
      }
    }
    
    return null;
  }
}

export const overpassService = new OverpassService(); 