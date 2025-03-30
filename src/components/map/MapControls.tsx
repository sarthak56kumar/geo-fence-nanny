
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Layers } from 'lucide-react';

interface MapControlsProps {
  onLocateUser: () => void;
  onToggleMapStyle: () => void;
  onToggleAddingGeofence: () => void;
  addingGeofence: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({
  onLocateUser,
  onToggleMapStyle,
  onToggleAddingGeofence,
  addingGeofence
}) => {
  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-2">
      <Button 
        size="sm" 
        onClick={onLocateUser}
        className="group"
      >
        <MapPin className="mr-2 h-4 w-4" />
        Locate Me
      </Button>
      
      <Button 
        size="sm"
        onClick={onToggleMapStyle}
      >
        <Layers className="mr-2 h-4 w-4" />
        Toggle Map
      </Button>
      
      <Button 
        size="sm" 
        variant={addingGeofence ? "destructive" : "default"}
        onClick={onToggleAddingGeofence}
      >
        {addingGeofence ? 'Cancel' : 'Add Geofence'}
      </Button>
    </div>
  );
};

export default MapControls;
