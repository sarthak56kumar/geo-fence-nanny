
import React from 'react';
import { Bell, MapPin, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGeofence } from '@/context/GeofenceContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { geofences, userLocation, isPointInGeofence, locateUser } = useGeofence();
  
  // Count active restrictions
  const activeRestrictions = userLocation 
    ? geofences.filter(g => g.enabled && isPointInGeofence(userLocation, g))
    : [];
  
  const hasActiveCamera = activeRestrictions.some(g => g.disableCamera);
  const hasActiveMic = activeRestrictions.some(g => g.disableMicrophone);
  
  return (
    <header className="bg-card border-b border-border p-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <MapPin className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">GeoFence Nanny</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        {(hasActiveCamera || hasActiveMic) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-destructive" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="p-2 text-sm font-medium">Active Restrictions</div>
              {hasActiveCamera && (
                <DropdownMenuItem className="flex items-center text-destructive">
                  <span className="mr-2">🚫</span> Camera disabled
                </DropdownMenuItem>
              )}
              {hasActiveMic && (
                <DropdownMenuItem className="flex items-center text-destructive">
                  <span className="mr-2">🚫</span> Microphone disabled
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => locateUser()}
        >
          <MapPin className="h-4 w-4 mr-1" />
          Update Location
        </Button>
        
        <Link to="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
