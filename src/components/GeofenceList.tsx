
import React from 'react';
import { useGeofence } from '@/context/GeofenceContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MapPin, Trash2, CameraOff, MicOff } from 'lucide-react';

const GeofenceList: React.FC = () => {
  const { 
    geofences, 
    removeGeofence, 
    updateGeofence, 
    userLocation, 
    isPointInGeofence 
  } = useGeofence();

  // Check if user is inside a specific geofence
  const isInsideGeofence = (geofenceId: string) => {
    if (!userLocation) return false;
    const geofence = geofences.find(g => g.id === geofenceId);
    if (!geofence) return false;
    return isPointInGeofence(userLocation, geofence);
  };

  if (geofences.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No geofences added yet.</p>
        <p className="text-sm mt-2">Click "Add Geofence" on the map to create one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      {geofences.map(geofence => (
        <Card 
          key={geofence.id} 
          className={`overflow-hidden ${isInsideGeofence(geofence.id) ? 'border-geofence-blue' : ''}`}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{geofence.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" /> 
                  {geofence.center[1].toFixed(4)}, {geofence.center[0].toFixed(4)}
                </CardDescription>
              </div>
              
              <div className="flex items-center space-x-1">
                <Switch 
                  checked={geofence.enabled} 
                  onCheckedChange={(checked) => updateGeofence(geofence.id, { enabled: checked })}
                />
                <span className="text-xs ml-1 text-muted-foreground">
                  {geofence.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </CardHeader>
          
          {isInsideGeofence(geofence.id) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 text-sm flex items-center justify-between">
              <span className="font-medium text-blue-700 dark:text-blue-300">
                You are inside this geofence
              </span>
              
              <div className="flex space-x-2">
                {geofence.disableCamera && <CameraOff className="h-4 w-4 text-destructive" />}
                {geofence.disableMicrophone && <MicOff className="h-4 w-4 text-destructive" />}
              </div>
            </div>
          )}
          
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`name-${geofence.id}`}>Name</Label>
              </div>
              <Input 
                id={`name-${geofence.id}`}
                value={geofence.name} 
                onChange={(e) => updateGeofence(geofence.id, { name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Radius: {geofence.radius.toFixed(1)} km</Label>
              </div>
              <Slider 
                value={[geofence.radius]} 
                min={0.1} 
                max={5} 
                step={0.1}
                onValueChange={(value) => updateGeofence(geofence.id, { radius: value[0] })}
              />
            </div>
            
            <Separator className="my-2" />
            
            <div className="space-y-3">
              <Label>Restrictions</Label>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CameraOff className="h-4 w-4" />
                  <span className="text-sm">Disable Camera</span>
                </div>
                <Switch 
                  checked={geofence.disableCamera} 
                  onCheckedChange={(checked) => updateGeofence(geofence.id, { disableCamera: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MicOff className="h-4 w-4" />
                  <span className="text-sm">Disable Microphone</span>
                </div>
                <Switch 
                  checked={geofence.disableMicrophone} 
                  onCheckedChange={(checked) => updateGeofence(geofence.id, { disableMicrophone: checked })}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="pt-0">
            <Button 
              variant="destructive" 
              size="sm" 
              className="ml-auto"
              onClick={() => removeGeofence(geofence.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Remove
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default GeofenceList;
