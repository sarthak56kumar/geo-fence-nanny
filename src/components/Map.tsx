
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useGeofence } from '@/context/GeofenceContext';
import { MAPBOX_CONFIG } from '@/config/mapbox';
import * as turf from '@turf/turf';
import { Button } from '@/components/ui/button';
import { MapPin, Layers, Navigation } from 'lucide-react';

// Set mapbox token
mapboxgl.accessToken = MAPBOX_CONFIG.mapboxApiAccessToken;

const Map: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [addingGeofence, setAddingGeofence] = useState(false);
  const [mapStyle, setMapStyle] = useState<string>(MAPBOX_CONFIG.mapStyle);
  
  const { 
    geofences, 
    addGeofence, 
    userLocation, 
    locateUser, 
    checkGeofenceStatus,
    isPointInGeofence
  } = useGeofence();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: MAPBOX_CONFIG.defaultCenter,
      zoom: MAPBOX_CONFIG.defaultZoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl());
    
    // Add geolocate control
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    });
    map.current.addControl(geolocateControl);

    // Wait for map to load
    map.current.on('load', () => {
      // Add an empty geojson source for geofence circles
      map.current?.addSource('geofences', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add a fill layer for geofence areas
      map.current?.addLayer({
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
      map.current?.addLayer({
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

      // Initialize user location
      locateUser().then(location => {
        if (location && map.current) {
          map.current.flyTo({
            center: location,
            zoom: 14
          });
        }
      });
    });

    // Handle geofence creation
    map.current.on('click', (e) => {
      if (!addingGeofence || !map.current) return;
      
      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      
      // Add a new geofence
      addGeofence({
        center: coordinates,
        radius: MAPBOX_CONFIG.circleRadius,
        name: `Geofence ${geofences.length + 1}`,
        enabled: true,
        disableCamera: true,
        disableMicrophone: true
      });
      
      setAddingGeofence(false);
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapStyle]);

  // Update map style
  const toggleMapStyle = () => {
    const newStyle = mapStyle === 'mapbox://styles/mapbox/streets-v12' 
      ? 'mapbox://styles/mapbox/satellite-streets-v12' 
      : 'mapbox://styles/mapbox/streets-v12';
    
    setMapStyle(newStyle);
    
    if (map.current) {
      map.current.setStyle(newStyle);
    }
  };

  // Update map when geofences change
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // Update geofence source data
    const source = map.current.getSource('geofences') as mapboxgl.GeoJSONSource;
    if (!source) return;
    
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
    
  }, [geofences, userLocation]);

  // Update user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;
    
    // Create or update user marker
    if (!userMarker.current) {
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
      userMarker.current = new mapboxgl.Marker(el)
        .setLngLat(userLocation)
        .addTo(map.current);
    } else {
      userMarker.current.setLngLat(userLocation);
    }
    
    // Check geofence status when user location changes
    checkGeofenceStatus();
    
  }, [userLocation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map controls overlay */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-2">
        <Button 
          size="sm" 
          onClick={() => locateUser()}
          className="group"
        >
          <MapPin className="mr-2 h-4 w-4" />
          Locate Me
        </Button>
        
        <Button 
          size="sm"
          onClick={toggleMapStyle}
        >
          <Layers className="mr-2 h-4 w-4" />
          Toggle Map
        </Button>
        
        <Button 
          size="sm" 
          variant={addingGeofence ? "destructive" : "default"}
          onClick={() => setAddingGeofence(!addingGeofence)}
        >
          {addingGeofence ? 'Cancel' : 'Add Geofence'}
        </Button>
      </div>
      
      {/* Add geofence instructions */}
      {addingGeofence && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-card p-4 rounded-md shadow-md border border-border">
          <p className="text-sm font-medium">Click anywhere on the map to add a geofence</p>
        </div>
      )}
    </div>
  );
};

export default Map;
