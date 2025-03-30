
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useGeofence } from '@/context/GeofenceContext';
import { MAPBOX_CONFIG } from '@/config/mapbox';
import MapControls from '@/components/map/MapControls';
import MapOverlays from '@/components/map/MapOverlays';
import { updateGeofencesSource, initializeGeofenceLayers, createUserMarker } from '@/utils/mapUtils';

// Set mapbox token
mapboxgl.accessToken = MAPBOX_CONFIG.mapboxApiAccessToken;

const Map: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [addingGeofence, setAddingGeofence] = useState(false);
  const [mapStyle, setMapStyle] = useState<string>(MAPBOX_CONFIG.mapStyle);
  const [mapInitialized, setMapInitialized] = useState(false);
  
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

    console.log("Initializing map...");
    
    try {
      // Create map instance
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
      
      // Wait for map to load
      map.current.on('load', () => {
        console.log("Map loaded successfully");
        
        // Initialize geofence layers
        if (map.current) {
          initializeGeofenceLayers(map.current);
          
          // Update map with current geofences
          if (geofences.length > 0) {
            updateGeofencesSource(map.current, geofences, userLocation, isPointInGeofence);
          }
        }
        
        setMapInitialized(true);

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

      // Handle map errors
      map.current.on('error', (e) => {
        console.error("Map error:", e);
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
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapInitialized(false);
    }

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
  };

  // Update map when geofences change
  useEffect(() => {
    if (!map.current || !mapInitialized) return;
    
    // Check if style is loaded before updating geofences
    if (map.current.isStyleLoaded()) {
      console.log("Updating geofences on map");
      updateGeofencesSource(map.current, geofences, userLocation, isPointInGeofence);
    } else {
      // Wait for style to load and then update
      map.current.once('style.load', () => {
        console.log("Style loaded, updating geofences");
        if (map.current) {
          initializeGeofenceLayers(map.current);
          updateGeofencesSource(map.current, geofences, userLocation, isPointInGeofence);
        }
      });
    }
  }, [geofences, userLocation, mapInitialized]);

  // Update user location marker
  useEffect(() => {
    if (!map.current || !userLocation || !mapInitialized) return;
    
    if (!map.current.isStyleLoaded()) {
      map.current.once('style.load', () => {
        if (map.current && userLocation) {
          // Create or update user marker
          if (!userMarker.current) {
            userMarker.current = createUserMarker(map.current, userLocation);
          } else {
            userMarker.current.setLngLat(userLocation);
          }
        }
      });
      return;
    }
    
    // Create or update user marker
    if (!userMarker.current) {
      userMarker.current = createUserMarker(map.current, userLocation);
    } else {
      userMarker.current.setLngLat(userLocation);
    }
    
    // Check geofence status when user location changes
    checkGeofenceStatus();
  }, [userLocation, mapInitialized]);

  // Toggle adding geofence mode
  const toggleAddingGeofence = () => {
    setAddingGeofence(!addingGeofence);
  };

  return (
    <div className="relative w-full h-full" style={{ minHeight: '400px', height: '100%' }}>
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map controls */}
      <MapControls 
        onLocateUser={locateUser}
        onToggleMapStyle={toggleMapStyle}
        onToggleAddingGeofence={toggleAddingGeofence}
        addingGeofence={addingGeofence}
      />
      
      {/* Map overlays (instructions and loading) */}
      <MapOverlays 
        addingGeofence={addingGeofence}
        mapInitialized={mapInitialized}
      />
    </div>
  );
};

export default Map;
