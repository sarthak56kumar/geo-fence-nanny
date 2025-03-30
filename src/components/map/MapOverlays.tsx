
import React from 'react';

interface MapOverlaysProps {
  addingGeofence: boolean;
  mapInitialized: boolean;
}

const MapOverlays: React.FC<MapOverlaysProps> = ({ addingGeofence, mapInitialized }) => {
  return (
    <>
      {/* Add geofence instructions */}
      {addingGeofence && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-card p-4 rounded-md shadow-md border border-border">
          <p className="text-sm font-medium">Click anywhere on the map to add a geofence</p>
        </div>
      )}
      
      {/* Loading indicator */}
      {!mapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm font-medium">Loading map...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default MapOverlays;
