
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import { Geofence } from '@/context/GeofenceContext';

// Update the map's geofence source with the current geofences
export const updateGeofencesSource = (
  map: mapboxgl.Map,
  geofences: Geofence[],
  userLocation: [number, number] | null,
  isPointInGeofence: (point: [number, number], geofence: Geofence) => boolean
) => {
  if (!map || !map.isStyleLoaded()) return;

  try {
    // Get the geofences source
    const source = map.getSource('geofences') as mapboxgl.GeoJSONSource;
    if (!source) {
      console.error("Geofences source not found");
      return;
    }
    
    // Create features for all geofences
    const features = geofences.map(geofence => {
      const circle = turf.circle(
        geofence.center, 
        geofence.radius, 
        { steps: 64, units: 'kilometers' }
      );
      
      // Add properties to the circle
      circle.properties = {
        id: geofence.id,
        name: geofence.name,
        enabled: geofence.enabled,
        active: userLocation ? isPointInGeofence(userLocation, geofence) : false
      };
      
      return circle;
    });
    
    // Update the source data
    source.setData({
      type: 'FeatureCollection',
      features
    });
  } catch (error) {
    console.error("Error updating geofences:", error);
  }
};

// Initialize map geofence layers
export const initializeGeofenceLayers = (map: mapboxgl.Map) => {
  // Add an empty geojson source for geofence circles
  map.addSource('geofences', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  // Add a fill layer for geofence areas
  map.addLayer({
    id: 'geofence-fills',
    type: 'fill',
    source: 'geofences',
    paint: {
      'fill-color': [
        'case',
        ['boolean', ['get', 'active'], false],
        '#3B82F680',  // Active geofence - semi-transparent blue
        '#10B98180'   // Inactive geofence - semi-transparent green
      ],
      'fill-opacity': 0.3
    }
  });

  // Add a border line for geofence areas
  map.addLayer({
    id: 'geofence-borders',
    type: 'line',
    source: 'geofences',
    paint: {
      'line-color': [
        'case',
        ['boolean', ['get', 'active'], false],
        '#3B82F6',  // Active geofence - blue
        '#10B981'   // Inactive geofence - green
      ],
      'line-width': 2
    }
  });
};

// Create a user location marker
export const createUserMarker = (map: mapboxgl.Map, userLocation: [number, number]) => {
  // Create a DOM element for the marker
  const el = document.createElement('div');
  el.className = 'user-marker';
  el.style.width = '20px';
  el.style.height = '20px';
  el.style.borderRadius = '50%';
  el.style.backgroundColor = '#3B82F6';
  el.style.border = '3px solid white';
  el.style.boxShadow = '0 0 0 2px rgba(0, 0, 0, 0.1)';

  // Add pulse animation
  const pulse = document.createElement('div');
  pulse.className = 'animate-pulse';
  pulse.style.position = 'absolute';
  pulse.style.width = '30px';
  pulse.style.height = '30px';
  pulse.style.borderRadius = '50%';
  pulse.style.backgroundColor = 'rgba(59, 130, 246, 0.5)';
  pulse.style.top = '-8px';
  pulse.style.left = '-8px';
  pulse.style.zIndex = '-1';
  el.appendChild(pulse);

  // Create the marker
  return new mapboxgl.Marker(el)
    .setLngLat(userLocation)
    .addTo(map);
};
