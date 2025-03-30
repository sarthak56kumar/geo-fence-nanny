
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MAPBOX_CONFIG } from '@/config/mapbox';
import * as turf from '@turf/turf';
import { toast } from '@/components/ui/use-toast';

// Define types
export type Coordinate = [number, number]; // [longitude, latitude]

export interface Geofence {
  id: string;
  center: Coordinate;
  radius: number; // in kilometers
  name: string;
  enabled: boolean;
  disableCamera: boolean;
  disableMicrophone: boolean;
}

interface GeofenceContextType {
  geofences: Geofence[];
  activeGeofence: Geofence | null;
  userLocation: Coordinate | null;
  isLoading: boolean;
  addGeofence: (geofence: Omit<Geofence, 'id'>) => void;
  removeGeofence: (id: string) => void;
  updateGeofence: (id: string, data: Partial<Geofence>) => void;
  setActiveGeofence: (geofence: Geofence | null) => void;
  isPointInGeofence: (point: Coordinate, geofence: Geofence) => boolean;
  locateUser: () => Promise<Coordinate | null>;
  checkGeofenceStatus: () => void;
}

const defaultContext: GeofenceContextType = {
  geofences: [],
  activeGeofence: null,
  userLocation: null,
  isLoading: true,
  addGeofence: () => {},
  removeGeofence: () => {},
  updateGeofence: () => {},
  setActiveGeofence: () => {},
  isPointInGeofence: () => false,
  locateUser: async () => null,
  checkGeofenceStatus: () => {},
};

// Create context
const GeofenceContext = createContext<GeofenceContextType>(defaultContext);

// Context provider component
export const GeofenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [activeGeofence, setActiveGeofence] = useState<Geofence | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastGeofenceState, setLastGeofenceState] = useState<Record<string, boolean>>({});

  // Load geofences from localStorage
  useEffect(() => {
    try {
      const savedGeofences = localStorage.getItem('geofences');
      if (savedGeofences) {
        setGeofences(JSON.parse(savedGeofences));
      }
    } catch (error) {
      console.error("Failed to load geofences from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save geofences to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('geofences', JSON.stringify(geofences));
    }
  }, [geofences, isLoading]);

  // Add a new geofence
  const addGeofence = (geofence: Omit<Geofence, 'id'>) => {
    const newGeofence: Geofence = {
      ...geofence,
      id: `geofence-${Date.now()}`,
    };
    setGeofences(prev => [...prev, newGeofence]);
    toast({
      title: "Geofence created",
      description: `Created geofence: ${newGeofence.name}`,
    });
  };

  // Remove a geofence
  const removeGeofence = (id: string) => {
    setGeofences(prev => prev.filter(geofence => geofence.id !== id));
    if (activeGeofence?.id === id) {
      setActiveGeofence(null);
    }
    toast({
      title: "Geofence removed",
      description: "The geofence has been removed successfully",
    });
  };

  // Update a geofence
  const updateGeofence = (id: string, data: Partial<Geofence>) => {
    setGeofences(prev => 
      prev.map(geofence => 
        geofence.id === id 
          ? { ...geofence, ...data } 
          : geofence
      )
    );
    
    // Update active geofence if it's the one being updated
    if (activeGeofence?.id === id) {
      setActiveGeofence(prev => prev ? { ...prev, ...data } : null);
    }
  };

  // Check if a point is inside a geofence
  const isPointInGeofence = (point: Coordinate, geofence: Geofence): boolean => {
    if (!point || !geofence) return false;
    
    // Create a circle geofence using turf
    const options = { steps: 64, units: 'kilometers' as turf.Units };
    const circle = turf.circle(geofence.center, geofence.radius, options);
    
    // Check if point is inside circle
    const pt = turf.point(point);
    return turf.booleanPointInPolygon(pt, circle);
  };

  // Get user's current location
  const locateUser = async (): Promise<Coordinate | null> => {
    try {
      setIsLoading(true);
      
      // Mock API for development - in a real app, use browser's Geolocation API
      // or Capacitor's Geolocation plugin for mobile
      const position = await new Promise<GeolocationPosition>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (error) => {
            console.error("Error getting location:", error);
            throw error;
          },
          { enableHighAccuracy: true }
        );
      });
      
      const location: Coordinate = [position.coords.longitude, position.coords.latitude];
      setUserLocation(location);
      return location;
    } catch (error) {
      console.error("Failed to get user location:", error);
      toast({
        title: "Location error",
        description: "Unable to get your location. Please check your permissions.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is inside any geofences and trigger appropriate actions
  const checkGeofenceStatus = async () => {
    const location = await locateUser();
    if (!location) return;
    
    // Check each geofence
    geofences.forEach(geofence => {
      if (!geofence.enabled) return;
      
      const isInside = isPointInGeofence(location, geofence);
      const wasInside = lastGeofenceState[geofence.id] || false;
      
      // Status changed - entered or exited the geofence
      if (isInside !== wasInside) {
        if (isInside) {
          // User entered the geofence
          toast({
            title: `Entered: ${geofence.name}`,
            description: "You've entered a geofenced area",
            variant: "default",
          });
          
          // Logic to disable camera/microphone would go here
          // This is just a simulation as web apps can't control device hardware directly
          if (geofence.disableCamera) {
            console.log(`Camera disabled in ${geofence.name}`);
          }
          
          if (geofence.disableMicrophone) {
            console.log(`Microphone disabled in ${geofence.name}`);
          }
        } else {
          // User exited the geofence
          toast({
            title: `Exited: ${geofence.name}`,
            description: "You've left a geofenced area",
            variant: "default",
          });
          
          // Logic to re-enable camera/microphone
          console.log(`Camera and microphone restrictions lifted from ${geofence.name}`);
        }
        
        // Update last known state
        setLastGeofenceState(prev => ({
          ...prev,
          [geofence.id]: isInside
        }));
      }
    });
  };

  // Context value
  const contextValue: GeofenceContextType = {
    geofences,
    activeGeofence,
    userLocation,
    isLoading,
    addGeofence,
    removeGeofence,
    updateGeofence,
    setActiveGeofence,
    isPointInGeofence,
    locateUser,
    checkGeofenceStatus,
  };

  return (
    <GeofenceContext.Provider value={contextValue}>
      {children}
    </GeofenceContext.Provider>
  );
};

// Custom hook to use the context
export const useGeofence = () => useContext(GeofenceContext);
